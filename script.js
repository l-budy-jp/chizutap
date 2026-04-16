/* ============================
   グローバル変数
============================ */
let selectedPrefKey = null;
let selectedCityKey = null;
let selectedTownKey = null;
let banchi = "";
let ADDRESS_DATA = {};   // ← CSV から生成される住所データ
/* ============================
   職場へ（Googleマップのラベルを参照）
============================ */
function goWork() {
    const url = "https://www.google.com/maps/dir/?api=1&destination=Work";
    window.open(url, "_blank");
    popup("Googleマップの職場を開きます");
}
/* ============================
   自宅へ（Googleマップのラベルを参照）
============================ */
function goHome() {
    const url = "https://www.google.com/maps/dir/?api=1&destination=Home";
    window.open(url, "_blank");
    popup("Googleマップの自宅を開きます");
}

/* ============================
   CSV 読み込み → ADDRESS_DATA 生成
============================ */
async function loadAddressData() {
    const res = await fetch("./utf_ken_all.csv");
    const text = await res.text();
    const lines = text.split("\n");

    const data = {};

    for (const line of lines) {
        const cols = line.split(",");

        if (cols.length < 9) continue;

        const pref = cols[6].replace(/"/g, "");
        const city = cols[7].replace(/"/g, "");
        const town = cols[8].replace(/"/g, "");

        if (!data[pref]) {
            data[pref] = {
                kanji: pref,
                hira: wanakana.toHiragana(pref),
                kana: wanakana.toKatakana(pref),
                cities: {}
            };
        }

        if (!data[pref].cities[city]) {
            data[pref].cities[city] = {
                kanji: city,
                hira: wanakana.toHiragana(city),
                kana: wanakana.toKatakana(city),
                towns: {}
            };
        }

        if (!data[pref].cities[city].towns[town]) {
            data[pref].cities[city].towns[town] = {
                kanji: town,
                hira: wanakana.toHiragana(town),
                kana: wanakana.toKatakana(town)
            };
        }
    }

    ADDRESS_DATA = data;

    initPrefectures();
    updateSelectedInfo();
    updateBanchi();
}

/* ============================
   文字サイズ変更
============================ */
function changeFontSize(size) {
    let fontSize = "16px";
    let padding = "6px 10px";

    if (size === "large") {
        fontSize = "22px";
        padding = "12px 16px";
    }
    if (size === "medium") {
        fontSize = "18px";
        padding = "8px 12px";
    }
    if (size === "small") {
        fontSize = "14px";
        padding = "4px 8px";
    }

    document.getElementById("header-box").style.fontSize = fontSize;

    document.querySelectorAll("#header-box span, #header-box div").forEach(el => {
        el.style.fontSize = fontSize;
    });

    document.querySelectorAll("button").forEach(btn => {
        btn.style.fontSize = fontSize;
        btn.style.padding = padding;
    });

    document.getElementById("banchiDisplay").style.fontSize = fontSize;

    popup("文字サイズを変更しました");
}

/* ============================
   戻る
============================ */
function goBack() {
    popup("ひとつ前に戻ります");
    history.back();
}

/* ============================
   自宅へ
============================ */
function goHome() {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeAddress)}`;
    window.open(url, "_blank");
    popup("自宅に移動します");
}

/* ============================
   交番検索
============================ */
function findPolice() {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("交番")}`;
    window.open(url, "_blank");
    popup("近くの交番を検索します");
}

/* ============================
   リセット
============================ */
function resetAll() {
    selectedPrefKey = null;
    selectedCityKey = null;
    selectedTownKey = null;
    banchi = "";

    document.getElementById("prefArea").innerHTML = "";
    document.getElementById("cityArea").innerHTML = "";
    document.getElementById("townArea").innerHTML = "";

    initPrefectures();
    updateSelectedInfo();
    updateBanchi();

    popup("リセットしました");
}

/* ============================
   ポップアップ
============================ */
function popup(message) {
    const p = document.getElementById("popup");
    p.textContent = message;
    p.style.opacity = 1;
    setTimeout(() => p.style.opacity = 0, 1500);
}

/* ============================
   都道府県ボタン生成
============================ */
function initPrefectures() {
    const prefArea = document.getElementById("prefArea");
    prefArea.innerHTML = "";

    Object.keys(ADDRESS_DATA).forEach(prefKey => {
        const pref = ADDRESS_DATA[prefKey];
        const btn = document.createElement("button");

        btn.innerHTML = `
            ${pref.kanji}<br>
            <span style="font-size:12px;color:#555;">
                ${pref.hira} / ${wanakana.toRomaji(pref.hira)}
            </span>
        `;

        btn.onclick = () => {
            popup(pref.kanji + " を選択しました");
            selectPref(prefKey);
        };

        prefArea.appendChild(btn);
    });
}

/* ============================
   市区町村ボタン生成
============================ */
function selectPref(prefKey) {
    selectedPrefKey = prefKey;
    selectedCityKey = null;
    selectedTownKey = null;

    document.getElementById("cityArea").innerHTML = "";
    document.getElementById("townArea").innerHTML = "";

    updateSelectedInfo();

    const cityArea = document.getElementById("cityArea");
    const cities = ADDRESS_DATA[prefKey].cities;

    Object.keys(cities).forEach(cityKey => {
        const city = cities[cityKey];
        const btn = document.createElement("button");

        btn.innerHTML = `
            ${city.kanji}<br>
            <span style="font-size:12px;color:#555;">
                ${city.hira} / ${wanakana.toRomaji(city.hira)}
            </span>
        `;

        btn.onclick = () => {
            popup(city.kanji + " を選択しました");
            selectCity(cityKey);
        };

        cityArea.appendChild(btn);
    });
}

/* ============================
   町名ボタン生成
============================ */
function selectCity(cityKey) {
    selectedCityKey = cityKey;
    selectedTownKey = null;

    document.getElementById("townArea").innerHTML = "";
    updateSelectedInfo();

    const townArea = document.getElementById("townArea");
    const towns = ADDRESS_DATA[selectedPrefKey].cities[cityKey].towns;

    Object.keys(towns).forEach(townKey => {
        const town = towns[townKey];
        const btn = document.createElement("button");

        btn.innerHTML = `
            ${town.kanji}<br>
            <span style="font-size:12px;color:#555;">
                ${town.hira} / ${wanakana.toRomaji(town.hira)}
            </span>
        `;

        btn.onclick = () => {
            popup(town.kanji + " を選択しました");
            selectTown(townKey);
        };

        townArea.appendChild(btn);
    });
}

/* ============================
   町名選択
============================ */
function selectTown(townKey) {
    selectedTownKey = townKey;
    updateSelectedInfo();
}

/* ============================
   番地入力
============================ */
function pressNum(ch) {
    banchi += ch;
    updateBanchi();
}

function backspace() {
    banchi = banchi.slice(0, -1);
    updateBanchi();
}

function updateBanchi() {
    document.getElementById("banchiDisplay").textContent = banchi || "（未入力）";
    document.getElementById("selBanchi").textContent = banchi;
}

/* ============================
   選択情報の表示更新
============================ */
function updateSelectedInfo() {
    let kanji = "";
    let kana = "";
    let hira = "";
    let romaji = "";

    if (selectedPrefKey) {
        const p = ADDRESS_DATA[selectedPrefKey];
        kanji += p.kanji;
        kana += p.kana;
        hira += p.hira;
        romaji += wanakana.toRomaji(p.hira);
    }
    if (selectedPrefKey && selectedCityKey) {
        const c = ADDRESS_DATA[selectedPrefKey].cities[selectedCityKey];
        kanji += c.kanji;
        kana += c.kana;
        hira += c.hira;
        romaji += " " + wanakana.toRomaji(c.hira);
    }
    if (selectedPrefKey && selectedCityKey && selectedTownKey) {
        const t = ADDRESS_DATA[selectedPrefKey].cities[selectedCityKey].towns[selectedTownKey];
        kanji += t.kanji;
        kana += t.kana;
        hira += t.hira;
        romaji += " " + wanakana.toRomaji(t.hira);
    }

    document.getElementById("selKanji").textContent = kanji || "未選択";
    document.getElementById("selKana").textContent = kana || "未選択";
    document.getElementById("selHira").textContent = hira || "未選択";
    document.getElementById("selRomaji").textContent = romaji || "未選択";
}

/* ============================
   Google マップを開く
============================ */
function openMap() {
    if (!selectedPrefKey || !selectedCityKey || !selectedTownKey) {
        alert("都道府県・市区町村・町名を選択してください。");
        return;
    }

    const p = ADDRESS_DATA[selectedPrefKey];
    const c = p.cities[selectedCityKey];
    const t = c.towns[selectedTownKey];

    const fullAddress = p.kanji + c.kanji + t.kanji + (banchi ? banchi : "");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    window.open(url, "_blank");
}
