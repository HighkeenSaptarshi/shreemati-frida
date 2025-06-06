import {Platform} from 'react-native';

export const OS_TYPE = Platform.OS == 'ios' ? 'ios' : 'android';
export const APP_VERSION = Platform.OS == 'ios' ? '1.0.0' : '1.0.0';
export const secretKey = 'ShreematiPass';

// UAT base url
export const URL = "https://apishreematiuat.mjunction.in";
const BASE_URL = "https://apishreematiuat.mjunction.in/api/v1";
export const AccessToken = '+ZpBzhQiTWxAmYYJ1nxWNytDdaq2ld4lqm8Ayl+aadlWrxhDYA93VAPDVoZAgIkQif4QgsD8kn4E4M14gzPA++nAZ7WZWc2b7sGT88jKrun5k2Qk3s3+BA==';
export const hashKey = "HYVBbIEdyjkQhisEE7VP4VzVN//qb+kLy96tAtrzFLY=";

// LIVE base url
/* export const URL = 'https://api.shreenirmanmitra.com';
const BASE_URL = 'https://api.shreenirmanmitra.com/api/v1';
export const AccessToken = 'XUhnlPB9Xjc30jStjPc/6uGBtvOgkUK7B2OWjygDhRkGcq6BZkVhI7VOJ0CKHMAMAY6UChykWvhp0jISzU/XsHNzPe+0gS/q163SKN5JWS7vVB7U+8+WBA==';
export const hashKey = 'UvVQCYbTtiOChjyEmasVWFI2arIt406Z9tmpPZSjsos=';
 */

export {BASE_URL};
