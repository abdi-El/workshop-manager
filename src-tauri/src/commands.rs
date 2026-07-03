use reqwest::header::USER_AGENT;

#[tauri::command]
pub async fn fetch(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get(url)
        .header(
            USER_AGENT,
            "WorkshopManager/2.7 (https://github.com/abdi-El/workshop-manager)",
        )
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let body = response.text().await.map_err(|e| e.to_string())?;

    Ok(body)
}
