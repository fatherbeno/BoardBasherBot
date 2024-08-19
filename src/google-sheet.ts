import config from './config'
import * as botsheets from '../boardbasherbot-googleauth.json'
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
    email: botsheets.client_email,
    keyId: botsheets.private_key_id,
    key: botsheets.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive'],
});

export const sheet = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID, serviceAccountAuth);