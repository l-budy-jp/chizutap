import csv
import jaconv
import json

INPUT_CSV = "utf_ken_all.csv"
OUTPUT_JS = "address_data.js"

data = {}

with open(INPUT_CSV, encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        pref_kanji = row[6]
        city_kanji = row[7]
        town_kanji = row[8]

        pref_kana = row[3]
        city_kana = row[4]
        town_kana = row[5]

        pref_hira = jaconv.kata2hira(pref_kana)
        city_hira = jaconv.kata2hira(city_kana)
        town_hira = jaconv.kata2hira(town_kana)

        if pref_kanji not in data:
            data[pref_kanji] = {
                "kanji": pref_kanji,
                "kana": pref_kana,
                "hira": pref_hira,
                "cities": {}
            }

        if city_kanji not in data[pref_kanji]["cities"]:
            data[pref_kanji]["cities"][city_kanji] = {
                "kanji": city_kanji,
                "kana": city_kana,
                "hira": city_hira,
                "towns": {}
            }

        if town_kanji not in data[pref_kanji]["cities"][city_kanji]["towns"]:
            data[pref_kanji]["cities"][city_kanji]["towns"][town_kanji] = {
                "kanji": town_kanji,
                "kana": town_kana,
                "hira": town_hira
            }

# JS ファイルとして書き出し
with open(OUTPUT_JS, "w", encoding="utf-8") as f:
    f.write("const ADDRESS_DATA = ")
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(";")
