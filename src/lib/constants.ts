import path from "path";

const FILENAME = "data.json";
// 统一数据路径：在 Standalone 模式下 process.cwd() 是 dist 根目录
export const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", FILENAME);
export const DATA_DIR = path.dirname(DATA_FILE_PATH);