#[cfg(target_arch = "wasm32")]
mod cloudflare;
mod config;
mod page;
mod routes;

use topcoat::router::Router;
use yoyaku::ArticleIndex;

pub use page::render_home;

const ARTICLE_INDEX: &str = include_str!("../../public/data/articles.json");

pub fn router() -> Result<Router, serde_json::Error> {
    serde_json::from_str(ARTICLE_INDEX).map(router_with_index)
}

pub fn router_with_index(index: ArticleIndex) -> Router {
    routes::register(Router::builder().page(page::home))
        .app_context(index)
        .build()
}
