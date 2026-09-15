// Google Sheets & Drive integration helper
// Scopes: https://www.googleapis.com/auth/spreadsheets, https://www.googleapis.com/auth/drive.file

export interface DriveFolderInfo {
  id: string;
  name: string;
}

/**
 * Searches or creates a folder named "ใบเบิกวัสดุ" in the user's Google Drive.
 */
export async function getOrCreateRequisitionFolder(accessToken: string): Promise<string> {
  try {
    // 1. Search for existing folder named "ใบเบิกวัสดุ"
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='ใบเบิกวัสดุ' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id, name)`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // 2. If not found, create new folder
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ใบเบิกวัสดุ',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (createRes.ok) {
      const folder = await createRes.json();
      return folder.id;
    }
  } catch (err) {
    console.error('Failed to get/create Google Drive folder:', err);
  }
  return '';
}

/**
 * Uploads a generated PDF blob to Google Drive inside the "ใบเบิกวัสดุ" folder.
 */
export async function uploadPdfToDrive(
  accessToken: string,
  pdfBlob: Blob,
  fileName: string,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'application/pdf',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', pdfBlob);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink';
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive Upload error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}

/**
 * Appends a requisition entry row into the Google Sheet ("💰 เบิกจ่าย" or current sheet)
 */
export async function appendRequisitionToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: (string | number)[][]
): Promise<boolean> {
  try {
    const range = `${encodeURIComponent(sheetName)}!A:Z`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Error appending to Google Sheet:', err);
    return false;
  }
}

/**
 * Appends a stock-in entry row into the Google Sheet ("💸 รับเข้า")
 */
export async function appendStockInToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: (string | number)[][]
): Promise<boolean> {
  try {
    const range = `${encodeURIComponent(sheetName)}!A:Z`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Error appending to Google Sheet:', err);
    return false;
  }
}
