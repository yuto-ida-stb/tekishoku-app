import fs from 'fs';
import path from 'path';

// CharacterMeta 型定義をここにコピー (外部依存を排除するため)
interface CharacterMeta {
  name: string;
  image: string;
  shortDescription: string;
  resultDescription: string;
  strengthKeywords?: string[];
  suitableCategories?: string[];
  suitablePersonTypeVer1?: string;
  suitablePersonTypeVer2?: string;
  suitablePersonTypeVer3?: string;
  message?: string;
  workingStyle?: string;
}

// TSVファイルのパス
const TSV_PATH = path.resolve((process as any).cwd(), 'characters.tsv');
// 出力先ファイルパス
const OUTPUT_PATH = path.resolve((process as any).cwd(), 'src/data/Characters.ts');

function parseTsv(content: string): CharacterMeta[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split('\t');
    const records: CharacterMeta[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const record: Partial<CharacterMeta> = {};
        headers.forEach((header, index) => {
            const value = values[index] ? values[index].trim() : '';

            switch (header) {
                case 'キャラ名':
                    record.name = value;
                    // 画像パスはここで生成
                    if (value === "家計の金庫番長") record.image = "/kakei_no_kinkobancho.png";
                    else if (value === "ご近所の広報部長") record.image = "/gokinjo_no_koho_bucho.png";
                    else if (value === "献立パズルの名参謀") record.image = "/kondate_puzzle_no_meisanbo.png";
                    else if (value === "おもてなしコーディネーター") record.image = "/omotenashi_coordinator.png";
                    else if (value === "お買い物マスター") record.image = "/okaimono_master.png";
                    else if (value === "時短改善リーダー") record.image = "/jitan_kaizen_leader.png";
                    else if (value === "思い出編集長") record.image = "/omoide_henshucho.png";
                    else if (value === "暮らし彩るハンドメイド職人") record.image = "/kurashi_irodoru_handmade_shokunin.png";
                    else if (value === "イベント演出ディレクター") record.image = "/event_enshutsu_director.png";
                    else if (value === "縁の下のサポート部長") record.image = "/en_no_shita_support_bucho.png";
                    else if (value === "子育て応援団長") record.image = "/kosodate_ouendancho.png";
                    else if (value === "節約アイデア発明家") record.image = "/setsuyaku_idea_hatsumeika.png";
                    else if (value === "一点集中の精密マイスター") record.image = "/itten_shuchu_no_seimitsu_meister.png";
                    break;
                case '150文字説明':
                    record.shortDescription = value;
                    break;
                case 'キャラ紹介（300字）':
                    record.resultDescription = value;
                    break;
                case '主に高スコアがつく領域（カテゴリ）':
                    record.suitableCategories = value ? value.split(' / ').map(s => s.trim()) : [];
                    break;
                case '強み1':
                case '強み2':
                case '強み3':
                    if (value) {
                        if (!record.strengthKeywords) record.strengthKeywords = [];
                        record.strengthKeywords.push(value);
                    }
                    break;
                case 'こんな人に向いています_ver1':
                    record.suitablePersonTypeVer1 = value;
                    break;
                case 'こんな人に向いています_ver2':
                    record.suitablePersonTypeVer2 = value;
                    break;
                case 'こんな人に向いています_ver3':
                    record.suitablePersonTypeVer3 = value;
                    break;
                case 'メッセージ':
                    record.message = value;
                    break;
                case '向いている働き方':
                    record.workingStyle = value;
                    break;
            }
        });
        if (record.name && record.image && record.shortDescription && record.resultDescription && record.suitableCategories && record.strengthKeywords) {
            records.push(record as CharacterMeta);
        } else {
            // console.warn(`Skipping character...`);
        }
    }
    return records;
}

function generateCharactersTs(characters: CharacterMeta[]): string {
    const characterItems = characters.map(char => {
        const strengthKeywords = char.strengthKeywords ? `[${char.strengthKeywords.map(kw => `"${kw}"`).join(', ')}]` : '[]';
        const suitableCategories = char.suitableCategories ? `[${char.suitableCategories.map(cat => `"${cat}"`).join(', ')}]` : '[]';
        
        const suitablePersonTypeVer1 = char.suitablePersonTypeVer1 ? `"${char.suitablePersonTypeVer1}"` : 'undefined';
        const suitablePersonTypeVer2 = char.suitablePersonTypeVer2 ? `"${char.suitablePersonTypeVer2}"` : 'undefined';
        const suitablePersonTypeVer3 = char.suitablePersonTypeVer3 ? `"${char.suitablePersonTypeVer3}"` : 'undefined';
        const message = char.message ? `"${char.message}"` : 'undefined';
        const workingStyle = char.workingStyle ? `"${char.workingStyle}"` : 'undefined';
        const shortDescription = char.shortDescription ? `"${char.shortDescription}"` : 'undefined';
        const resultDescription = char.resultDescription ? `"${char.resultDescription}"` : 'undefined';

        return `  {
    name: "${char.name}",
    image: "${char.image}",
    shortDescription: ${shortDescription},
    resultDescription: ${resultDescription},
    strengthKeywords: ${strengthKeywords},
    suitableCategories: ${suitableCategories},
    suitablePersonTypeVer1: ${suitablePersonTypeVer1},
    suitablePersonTypeVer2: ${suitablePersonTypeVer2},
    suitablePersonTypeVer3: ${suitablePersonTypeVer3},
    message: ${message},
    workingStyle: ${workingStyle},
  }`;
    }).join(',\n');

    return `// AUTO-GENERATED by src/data/parseTsv.ts\n// このファイルを直接編集しないでください\n\nimport { CharacterMeta } from "../types/diagnosis";\n\nexport const CHARACTERS: CharacterMeta[] = [\n${characterItems}\n];\n\nexport const CHARACTER_BY_NAME: Record<string, CharacterMeta> =\n  Object.fromEntries(CHARACTERS.map((c) => [c.name, c]));\n`;
}

function main() {
    if (!fs.existsSync(TSV_PATH)) {
        console.error(`❌ ${TSV_PATH} が見つかりません。`);
        (process as any).exit(1);
    }

    const tsvContent = fs.readFileSync(TSV_PATH, 'utf-8');
    const parsedCharacters = parseTsv(tsvContent);

    if (parsedCharacters.length === 0) {
        console.error(`❌ ${TSV_PATH} から有効なキャラクターデータが読み取れませんでした。`);
        (process as any).exit(1);
    }

    const tsContent = generateCharactersTs(parsedCharacters);
    fs.writeFileSync(OUTPUT_PATH, tsContent, 'utf-8');
    console.log(`✅ ${OUTPUT_PATH} を生成しました。キャラクター数: ${parsedCharacters.length} 件`);
}

main();