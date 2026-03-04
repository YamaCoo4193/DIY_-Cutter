export const HowToPage = (): JSX.Element => (
  <main className="page">
    <header className="topbar">
      <div>
        <p className="eyebrow">How To Use</p>
        <h1 className="page-title">DIY Cutter の使い方</h1>
      </div>
      <div className="topbar-actions">
        <a className="header-action-link" href="#/">
          材料算出へ戻る
        </a>
      </div>
    </header>

    <section className="panel how-to-hero">
      <h2>このページで分かること</h2>
      <p>
        DIY Cutter は、必要な部材を入力すると、どの長さの母材を何本買えばよいか、どのように切ると無駄が少ないかを確認できるアプリです。
      </p>
    </section>

    <section className="panel">
      <h2>使い方の流れ</h2>
      <div className="cards how-to-steps">
        <article className="card">
          <h3>1. 規格を準備する</h3>
          <p>上部の `規格追加` から、使いたい規格名と長さを登録します。すでに登録済みの規格は一覧から確認できます。</p>
        </article>
        <article className="card">
          <h3>2. 必要部材を入力する</h3>
          <p>材料、長さ、本数を入力します。複数行が必要な場合は `+ 行追加` で増やします。</p>
        </article>
        <article className="card">
          <h3>3. 母材長さを選ぶ</h3>
          <p>規格ごとに使用可能な母材長さをチェックします。不要な長さは外すことで、見積対象から除外できます。</p>
        </article>
        <article className="card">
          <h3>4. `OK` で反映する</h3>
          <p>入力内容は `OK` を押した時点で結果へ反映されます。変更後に再計算したい時も、もう一度 `OK` を押します。</p>
        </article>
      </div>
    </section>

    <section className="panel">
      <h2>結果の見方</h2>
      <div className="cards how-to-steps">
        <article className="card">
          <h3>必要材料</h3>
          <p>規格ごとに、どの母材長さが何本必要かを確認できます。端材の長さも合わせて見られます。</p>
        </article>
        <article className="card">
          <h3>カット図</h3>
          <p>1本の母材の中にどの部材が入るかを図で確認できます。切断順の目安として使えます。</p>
        </article>
        <article className="card">
          <h3>部材結果</h3>
          <p>入力した部材を長さごとに集計して確認できます。必要本数の見直しに使えます。</p>
        </article>
      </div>
    </section>

    <section className="panel">
      <h2>保存とバックアップ</h2>
      <div className="cards how-to-steps">
        <article className="card">
          <h3>結果を保存</h3>
          <p>`結果を保存` を押すと、現在反映済みの内容をこの端末のブラウザに保存できます。</p>
        </article>
        <article className="card">
          <h3>保存部材</h3>
          <p>上部の `保存部材` から、保存済みの結果を読み込み、削除、バックアップ出力できます。</p>
        </article>
        <article className="card">
          <h3>注意点</h3>
          <p>保存先は `LocalStorage` です。ブラウザデータ削除や端末変更に備えて、定期的にバックアップ JSON を出力してください。</p>
        </article>
      </div>
    </section>

    <section className="panel">
      <h2>よくある使い方のコツ</h2>
      <ul className="how-to-list">
        <li>同じ規格でも長さ違いは別項目として登録します。</li>
        <li>刃厚を変えたら `OK` を押して結果を更新します。</li>
        <li>スマホでは上部ボタンから `保存部材` と `規格追加` を開いて使うと見やすいです。</li>
        <li>印刷したい時はページ下部の `印刷プレビュー` を使います。</li>
      </ul>
    </section>
  </main>
);
