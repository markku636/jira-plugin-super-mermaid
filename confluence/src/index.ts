// Forge resolver。
//
// macro 模組的 manifest schema 要求必須有 resolver,但這個 app 幾乎用不到它:
// 圖表原始碼存在 macro 的 config 參數裡,跟著頁面版本走,前端用
// view.getContext() 就能讀到,不需要伺服端往返。
//
// 這樣設計的好處是這個 app 連 permissions.scopes 都不需要 —— 它不呼叫任何
// Confluence API。權限面越小,Marketplace 審查越單純。

import Resolver from '@forge/resolver';

const resolver = new Resolver();

/** 健康檢查:方便診斷部署問題。 */
resolver.define('ping', () => ({ ok: true, at: new Date().toISOString() }));

export const handler = resolver.getDefinitions();
