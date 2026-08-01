// Forge resolver。
//
// jira:issuePanel 的 manifest schema 要求必須有 resolver,但這個 app 的資料存取
// 刻意【不】走這裡:前端用 @forge/bridge 的 requestJira 直接讀寫 issue property,
// 等同「以使用者身分」操作 —— Jira 的權限模型自動生效,沒有編輯權的人寫不進去。
// 若改用 resolver + api.asApp(),就得自己重新實作一遍權限檢查,只會多一個出錯面。
//
// 這裡留給之後真正需要伺服端的工作:授權(licensing)檢查、跨 issue 查詢、
// webhook 觸發等。

import Resolver from '@forge/resolver';

const resolver = new Resolver();

/** 健康檢查:前端啟動時確認 resolver 通得到,方便診斷部署問題。 */
resolver.define('ping', () => ({ ok: true, at: new Date().toISOString() }));

export const handler = resolver.getDefinitions();
