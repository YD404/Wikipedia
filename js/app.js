/**
 * Wikipedia Clone - Article Renderer
 * JSONデータから記事を動的に生成するJavaScript
 */

class WikiArticleRenderer {
    constructor() {
        this.articleContainer = document.getElementById('article-content');
    }

    /**
     * JSONファイルから記事を読み込んでレンダリング
     * @param {string} jsonPath - JSONファイルのパス
     */
    async loadArticle(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`記事の読み込みに失敗しました: ${response.status}`);
            }
            const articleData = await response.json();
            this.renderArticle(articleData);
            // ページタイトルを更新
            document.title = `${articleData.title} - ワィキペディア`;
        } catch (error) {
            console.error('エラー:', error);
            this.showError(error.message);
        }
    }

    /**
     * 記事データからHTMLをレンダリング
     * @param {Object} data - 記事データ
     */
    renderArticle(data) {
        let html = '';

        // 通知（廃止通知など）
        if (data.notice) {
            html += this.renderNotice(data.notice);
        }

        // タイトル
        html += `<h1 class="article-title">${data.title}</h1>`;

        // 導入文
        html += `<div class="article-intro"><p>${data.intro}</p></div>`;

        // 目次
        html += this.renderToc(data.toc);

        // インフォボックス
        if (data.infobox) {
            html += this.renderInfobox(data.infobox);
        }

        // セクション
        for (const section of data.sections) {
            html += this.renderSection(section);
        }

        // カテゴリ
        html += this.renderCategories(data.categories);

        // 最終更新日時
        if (data.lastModified) {
            html += `<div class="last-modified">最終更新 ${data.lastModified}</div>`;
        }

        this.articleContainer.innerHTML = html;
    }

    /**
     * 通知ボックスをレンダリング（廃止通知など）
     */
    renderNotice(notice) {
        const typeClass = notice.type || 'info';
        return `
            <div class="article-notice ${typeClass}">
                <span class="notice-icon">${notice.icon || 'ℹ️'}</span>
                <div class="notice-content">
                    <b>${notice.title}</b> ${notice.text}
                </div>
            </div>
        `;
    }

    /**
     * 目次をレンダリング
     */
    renderToc(tocItems) {
        let html = `
            <div class="toc">
                <div class="toc-title">
                    <span>目次</span>
                    <span class="toc-toggle" onclick="toggleToc()">[非表示]</span>
                </div>
                <ul id="toc-list">
        `;

        for (const item of tocItems) {
            html += `<li><a href="#${item.id}"><span class="toc-number">${item.number}</span> ${item.title}</a>`;
            if (item.children && item.children.length > 0) {
                html += '<ul>';
                for (const child of item.children) {
                    html += `<li><a href="#${child.id}"><span class="toc-number">${child.number}</span> ${child.title}</a></li>`;
                }
                html += '</ul>';
            }
            html += '</li>';
        }

        html += '</ul></div>';
        return html;
    }

    /**
     * インフォボックスをレンダリング
     */
    renderInfobox(infobox) {
        let html = `
            <div class="infobox">
                <table>
                    <tr class="infobox-header">
                        <th colspan="2">${infobox.title}</th>
                    </tr>
        `;

        // 画像（あれば）
        if (infobox.image || infobox.imageCaption) {
            html += `
                <tr>
                    <td colspan="2" class="infobox-image">
                        <div class="image-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <circle cx="9" cy="9" r="1" fill="#666"/>
                                <circle cx="15" cy="9" r="1" fill="#666"/>
                            </svg>
                            <p class="image-caption">${infobox.imageCaption || ''}</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        // 情報行
        for (const row of infobox.rows) {
            html += `
                <tr>
                    <th>${row.label}</th>
                    <td>${row.value}</td>
                </tr>
            `;
        }

        html += '</table></div>';
        return html;
    }

    /**
     * セクションをレンダリング
     */
    renderSection(section) {
        let html = `<section id="${section.id}">`;
        html += `<h2><span class="section-edit">[<a href="#">編集</a>]</span>${section.title}</h2>`;

        // メインコンテンツ
        if (section.content) {
            html += section.content;
        }

        // サブセクション
        if (section.subsections) {
            for (const sub of section.subsections) {
                html += `<h3 id="${sub.id}">${sub.title}</h3>`;
                html += sub.content;
            }
        }

        // テーブル
        if (section.table) {
            html += this.renderTable(section.table);
        }

        // カラム
        if (section.columns) {
            html += this.renderColumns(section.columns);
        }

        // 関連リンク
        if (section.relatedLinks) {
            html += this.renderRelatedLinks(section.relatedLinks);
        }

        // 脚注
        if (section.references) {
            html += this.renderReferences(section.references);
        }

        // 外部リンク
        if (section.externalLinks) {
            html += this.renderExternalLinks(section.externalLinks);
        }

        html += '</section>';
        return html;
    }

    /**
     * テーブルをレンダリング
     */
    renderTable(table) {
        let html = '<table class="wikitable">';
        if (table.caption) {
            html += `<caption>${table.caption}</caption>`;
        }
        html += '<tr>';
        for (const header of table.headers) {
            html += `<th>${header}</th>`;
        }
        html += '</tr>';
        for (const row of table.rows) {
            html += '<tr>';
            for (const cell of row) {
                html += `<td>${cell}</td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    /**
     * カラムレイアウトをレンダリング
     */
    renderColumns(columns) {
        let html = '<div class="columns">';
        for (const col of columns) {
            html += '<div class="column">';
            html += `<h4>${col.title}</h4><ul>`;
            for (const item of col.items) {
                html += `<li>${item}</li>`;
            }
            html += '</ul></div>';
        }
        html += '</div>';
        return html;
    }

    /**
     * 関連リンクをレンダリング
     */
    renderRelatedLinks(links) {
        let html = '<div class="related-links"><ul>';
        for (const link of links) {
            if (typeof link === 'object' && link.url) {
                html += `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`;
            } else {
                html += `<li><a href="#">${link}</a></li>`;
            }
        }
        html += '</ul></div>';
        return html;
    }

    /**
     * 脚注をレンダリング
     */
    renderReferences(refs) {
        let html = '<div class="references"><ol>';
        for (let i = 0; i < refs.length; i++) {
            html += `<li id="ref${i + 1}">^ <a href="#">${refs[i]}</a></li>`;
        }
        html += '</ol></div>';
        return html;
    }

    /**
     * 外部リンクをレンダリング
     */
    renderExternalLinks(links) {
        let html = '<ul>';
        for (const link of links) {
            html += `<li><a href="${link.url}" class="external">${link.title}</a></li>`;
        }
        html += '</ul>';
        return html;
    }

    /**
     * カテゴリをレンダリング
     */
    renderCategories(categories) {
        let html = '<div class="categories"><span class="categories-title">カテゴリ:</span><ul>';
        for (const cat of categories) {
            if (typeof cat === 'object' && cat.url) {
                html += `<li><a href="${cat.url}" target="_blank">${cat.title}</a></li>`;
            } else {
                html += `<li><a href="#">${cat}</a></li>`;
            }
        }
        html += '</ul></div>';
        return html;
    }

    /**
     * エラーメッセージを表示
     */
    showError(message) {
        this.articleContainer.innerHTML = `
            <div class="notice-box warning">
                <p><strong>エラー:</strong> ${message}</p>
                <p>記事が見つかりませんでした。</p>
            </div>
        `;
    }
}

// 目次の表示/非表示切り替え
function toggleToc() {
    const tocList = document.getElementById('toc-list');
    const toggle = document.querySelector('.toc-toggle');
    if (tocList.style.display === 'none') {
        tocList.style.display = 'block';
        toggle.textContent = '[非表示]';
    } else {
        tocList.style.display = 'none';
        toggle.textContent = '[表示]';
    }
}

// URLパラメータから記事を取得
function getArticleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('article') || 'index';
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new WikiArticleRenderer();
    const articleName = getArticleFromUrl();
    renderer.loadArticle(`articles/${articleName}.json`);
});
