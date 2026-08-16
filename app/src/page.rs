use topcoat::{
    Result,
    context::{Cx, app_context},
    router::page,
    view::view,
};
use yoyaku::{Article, ArticleIndex};

use crate::config::{HEADER_TITLE, REPOSITORY_URL, TITLE};

#[page("/")]
pub async fn home(cx: &Cx) -> Result {
    render_home(cx, app_context::<ArticleIndex>(cx)).await
}

fn format_date(date: &str) -> String {
    date.replace('-', ".")
}

fn searchable_text(article: &Article) -> String {
    format!(
        "{} {} {} {} {}",
        article.title,
        article.summary.join(" "),
        article.source,
        article.genre,
        article.technologies.join(" ")
    )
}

pub async fn render_home(cx: &Cx, index: &ArticleIndex) -> Result {
    let total = index.articles.len();
    view! {
        cx =>
        <!DOCTYPE html>
        <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="description" content="Gitで管理する記事要約アーカイブ">
                <title>(TITLE)</title>
                <link rel="stylesheet" href="/assets/style.css">
            </head>
            <body>
                <div class="app-shell">
                    <header class="site-header">
                        <div class="site-name">(HEADER_TITLE)</div>
                        <div class="header-meta">
                            <span data-total-count="">(format!("収録 {total}件"))</span>
                            <a href=(REPOSITORY_URL) target="_blank" rel="noopener noreferrer">
                                "GitHub リポジトリ ↗"
                            </a>
                        </div>
                    </header>

                    <section class="lead"><h1>(TITLE)</h1></section>

                    <div class="layout">
                        <aside class="sidebar" aria-label="記事検索">
                            <div class="sidebar-heading">
                                <strong>"記事を探す"</strong>
                                <span data-filter-count="">(format!("{total}件"))</span>
                            </div>
                            <form id="search-form">
                                <label class="search-box">
                                    <span aria-hidden="true">"⌕"</span>
                                    <input id="keyword" name="keyword" type="search" placeholder="キーワードを入力" autocomplete="off">
                                </label>

                                <label class="field">"ジャンル"
                                    <select id="genre" name="genre">
                                        <option value="">"すべて"</option>
                                        for genre in &index.facets.genres {
                                            <option value=(genre.as_str())>(genre.as_str())</option>
                                        }
                                    </select>
                                </label>
                                <label class="field">"使用技術"
                                    <select id="technology" name="technology">
                                        <option value="">"すべて"</option>
                                        for technology in &index.facets.technologies {
                                            <option value=(technology.as_str())>(technology.as_str())</option>
                                        }
                                    </select>
                                </label>
                                <label class="field">"掲載元"
                                    <select id="source" name="source">
                                        <option value="">"すべて"</option>
                                        for source in &index.facets.sources {
                                            <option value=(source.as_str())>(source.as_str())</option>
                                        }
                                    </select>
                                </label>

                                <fieldset class="date-field">
                                    <legend>"作成日"</legend>
                                    <div class="date-range">
                                        <input id="created-from" name="createdFrom" type="date" aria-label="作成日の開始">
                                        <span>"—"</span>
                                        <input id="created-to" name="createdTo" type="date" aria-label="作成日の終了">
                                    </div>
                                </fieldset>

                                <label class="field">"読了時間"
                                    <select id="max-minutes" name="maxMinutes">
                                        <option value="0">"指定なし"</option>
                                        <option value="5">"5分以内"</option>
                                        <option value="10">"10分以内"</option>
                                        <option value="15">"15分以内"</option>
                                        <option value="30">"30分以内"</option>
                                    </select>
                                </label>

                                <div class="active-conditions" data-active-conditions="" aria-live="polite"></div>
                                <button class="reset-button" type="reset">"条件をすべて解除"</button>
                            </form>
                        </aside>

                        <main class="content">
                            <div class="content-heading">
                                <h2>"該当する記事"</h2>
                                <div class="result-tools">
                                    <span data-result-count="">(format!("{total} / {total}件"))</span>
                                    <label class="sort-field">
                                        <span class="sr-only">"並び順"</span>
                                        <select id="sort" name="sort">
                                            <option value="updated-desc">"更新日の新しい順"</option>
                                            <option value="created-desc">"作成日の新しい順"</option>
                                            <option value="title-asc">"タイトル順"</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            if index.articles.is_empty() {
                                <div class="notice" data-notice="" role="status">"記事がまだありません。"</div>
                            } else {
                                <div class="notice" data-notice="" role="status" hidden=""></div>
                            }
                            <div class="article-grid" data-article-grid="">
                                for article in &index.articles {
                                    article_item(article: article)
                                }
                            </div>
                        </main>
                    </div>
                </div>

                <dialog class="article-dialog" id="article-dialog">
                    <div class="dialog-heading">
                        <span>"記事の要約"</span>
                        <button type="button" class="dialog-close" aria-label="閉じる">"×"</button>
                    </div>
                    <div class="dialog-body">
                        <div class="dialog-meta" data-dialog-meta=""></div>
                        <h2 class="dialog-title" data-dialog-title=""></h2>
                        <div class="dialog-tags" data-dialog-tags=""></div>
                        <div class="dialog-source-row">
                            <div class="dialog-dates" data-dialog-dates=""></div>
                            <a class="source-link" data-dialog-source="" target="_blank" rel="noopener noreferrer">
                                "元記事を開く ↗"
                            </a>
                        </div>
                        <h3 class="summary-label">"要約"</h3>
                        <div class="dialog-summary" data-dialog-summary=""></div>
                    </div>
                </dialog>

                <script type="module" src="/assets/main.js"></script>
            </body>
        </html>
    }
}

#[topcoat::view::component]
async fn article_item(article: &Article) -> Result {
    let searchable = searchable_text(article);
    let reading_minutes = article.reading_minutes.to_string();
    let created_at = article.created_at.as_str();
    let updated_at = article.updated_at.as_str();
    let aria_label = format!("{}の要約を開く", article.title);

    view! {
        <article
            class="article-item"
            data-article-id=(article.id.as_str())
            data-article-url=(article.url.as_str())
            data-title=(article.title.as_str())
            data-search=(searchable.as_str())
            data-source=(article.source.as_str())
            data-genre=(article.genre.as_str())
            data-reading-minutes=(reading_minutes.as_str())
            data-created-at=(created_at)
            data-updated-at=(updated_at)
        >
            <button type="button" class="article-card" aria-label=(aria_label.as_str())>
                <div class="visual">
                    <div class="visual-fallback">
                        <span class="visual-source">(article.source.as_str())</span>
                        <strong class="visual-title">
                            (article.ogp.as_ref().and_then(|ogp| ogp.title.as_deref()).unwrap_or(&article.title))
                        </strong>
                        <span class="visual-tech">(article.technologies.iter().take(3).cloned().collect::<Vec<_>>().join("　/　"))</span>
                    </div>
                    if let Some(image_url) = article.ogp.as_ref().and_then(|ogp| ogp.image_url.as_deref()) {
                        <img class="visual-image" src=(image_url) alt="" loading="lazy">
                    }
                </div>
                <div class="card-meta">
                    <span class="card-genre">(article.genre.as_str())</span>
                    <span>(format!("読了 {}分", article.reading_minutes))</span>
                </div>
                <h3 class="title">(article.title.as_str())</h3>
                <p class="card-summary">(article.summary.first().map_or("", String::as_str))</p>
                <div class="tags">
                    for technology in &article.technologies {
                        <span data-card-tech="">(technology.as_str())</span>
                    }
                </div>
                <div class="dates">
                    <span>(format!("作成 {}", format_date(created_at)))</span>
                    <span>(format!("更新 {}", format_date(updated_at)))</span>
                </div>
            </button>
            <template data-article-summary="">
                for (index, paragraph) in article.summary.iter().enumerate() {
                    if index >= 2 {
                        <p class="dialog-summary-line">(paragraph.as_str())</p>
                    } else {
                        <p>(paragraph.as_str())</p>
                    }
                }
            </template>
        </article>
    }
}
