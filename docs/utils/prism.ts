import Prism from "prismjs";
import bash from "prismjs/components/prism-bash.js?raw";
import clike from "prismjs/components/prism-clike.js?raw";
import css from "prismjs/components/prism-css.js?raw";
import java from "prismjs/components/prism-java.js?raw";
import javascript from "prismjs/components/prism-javascript.js?raw";
import jsx from "prismjs/components/prism-jsx.js?raw";
import markdown from "prismjs/components/prism-markdown.js?raw";
import markup from "prismjs/components/prism-markup.js?raw";
import php from "prismjs/components/prism-php.js?raw";
import python from "prismjs/components/prism-python.js?raw";
import sql from "prismjs/components/prism-sql.js?raw";
import tsx from "prismjs/components/prism-tsx.js?raw";
import typescript from "prismjs/components/prism-typescript.js?raw";
import yaml from "prismjs/components/prism-yaml.js?raw";

const loadLanguage = (source: string) => {
  Function("Prism", source)(Prism);
};

[
  markup,
  css,
  clike,
  javascript,
  jsx,
  typescript,
  tsx,
  yaml,
  markdown,
  bash,
  python,
  php,
  sql,
  java,
].forEach(loadLanguage);

export default Prism;
