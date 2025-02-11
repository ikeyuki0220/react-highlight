import _ from "lodash";
import parser from "react-html-parser";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>ハイライトサンプル</h1>
      <div>
        <Highlighter
          originStr={"僕は行きつけの定食屋でいつも半ライス大盛りと頼みます。"}
          keywords={["僕は", "半ライス", "ライス大盛り"]}
        />
      </div>
    </div>
  );
}

/**
 * キーワードに応じてハイライト開始～終了位置を返却する
 * @param {String} originStr 検索元の文字列
 * @return {Array} keywords 検索キーワード
 */
function makeHighlightIndexes(originStr = "", keywords = []) {
  const getHighlightIndexes = (keyword = "") => {
    const indexes = [];
    for (let i = 0; i < originStr.length; i++) {
      i = originStr.indexOf(keyword, i);
      if (i === -1) break; // ハイライト対象がなければbreak
      for (let j = 0; j < keyword.length; j++) indexes.push(i + j);
    }

    return indexes;
  };

  const highlightIndexes = keywords.flatMap((keyword) =>
    getHighlightIndexes(keyword)
  );

  // ハイライト対象の開始～終了位置を重複削除&昇順にして返却する
  return _.sortBy(_.uniq(highlightIndexes));
}

/**
 * ハイライト処理を実施するコンポーネント
 * @param {String} originStr 検索元の文字列
 * @return {Array} keywords 検索キーワード
 */
function Highlighter({ originStr = "", keywords = [] }) {
  let isInsertStartHtmlTag = true; // HTML開始タグ挿入用フラグ
  const highlightIndexes = makeHighlightIndexes(originStr, keywords);

  const highlightHtmlElement = [...originStr].reduce(
    (accumulator, currentValue, currentIndex) => {
      const isHighlight = highlightIndexes.includes(currentIndex);
      if (isHighlight && isInsertStartHtmlTag) {
        isInsertStartHtmlTag = false;
        return `${accumulator}<mark>${currentValue}`;
      }

      // 次の要素が連番ではない = ハイライト対象ではないのでHTML終了タグを挿入する
      const isInsertEndHtmlTag = !highlightIndexes.includes(currentIndex + 1);
      if (isHighlight && isInsertEndHtmlTag) {
        isInsertStartHtmlTag = true; // 次の要素にHTML開始タグを挿入できようにtrueにする
        return `${accumulator}${currentValue}</mark>`;
      }

      return accumulator + currentValue;
    },
    ""
  );

  // 文字列をHTMLに変換して返却する
  return parser(highlightHtmlElement);
}
