use topcoat::router::Body as TopcoatBody;
use worker::{Context, Env, HttpRequest, event};

#[event(fetch)]
async fn fetch(
    request: HttpRequest,
    _env: Env,
    _ctx: Context,
) -> worker::Result<topcoat::router::Response> {
    let router = crate::router().map_err(|error| {
        worker::Error::RustError(format!("invalid embedded article index: {error}"))
    })?;
    Ok(router.handle(request.map(TopcoatBody::new)).await)
}
