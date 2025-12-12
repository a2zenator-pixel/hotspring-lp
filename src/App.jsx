import React, { useEffect, useState } from "react";
import HotSpringEstateLP from "./HotSpringEstateLP";

// ここが合言葉（仲間にだけ共有するパスワード）
const ACCESS_PASSWORD = "onsen2525"; // お好きな文字に変えてOK

function App() {
  const [ok, setOk] = useState(false);
  const [input, setInput] = useState("");

  // 一度入室に成功した人は、次回以降パスワード不要にする（同じPC/ブラウザのみ）
  useEffect(() => {
    if (window.localStorage.getItem("hotspring_lp_ok") === "1") {
      setOk(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ACCESS_PASSWORD) {
      setOk(true);
      window.localStorage.setItem("hotspring_lp_ok", "1");
    } else {
      alert("パスワードが違います。");
    }
  };

  // まだパスワードが通っていないときは「入口画面」だけを表示
  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow max-w-sm w-full"
        >
          <h1 className="text-xl font-semibold mb-4 text-center">
            招待者限定ページ
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            オーナーから案内された合言葉を入力してください。
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            合言葉（パスワード）
          </label>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="例：onsen2025"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            入室する
          </button>

          <p className="mt-4 text-xs text-gray-400 text-center">
            ※ このURLは第三者に公開しないでください。
          </p>
        </form>
      </div>
    );
  }

  // 合言葉OKの人だけ、本物のLPを表示
  return (
    <HotSpringEstateLP
      initialLang="ja"
      email="XXXX@example.com"  // あなたのメールアドレスに書き換え
    />
  );
}

export default App;
