/**
 * Wikipedia Clone - Parts Loader
 * 共通パーツを動的に読み込むJavaScript
 */

class PartsLoader {
    /**
     * HTMLパーツを読み込んで指定の要素に挿入
     * @param {string} partPath - パーツファイルのパス
     * @param {string} targetSelector - 挿入先のセレクタ
     * @param {string} insertPosition - 挿入位置 ('replace', 'append', 'prepend')
     * @returns {Promise<void>}
     */
    static async loadPart(partPath, targetSelector, insertPosition = 'replace') {
        try {
            const response = await fetch(partPath);
            if (!response.ok) {
                throw new Error(`パーツの読み込みに失敗: ${partPath}`);
            }
            const html = await response.text();
            const target = document.querySelector(targetSelector);

            if (!target) {
                console.warn(`ターゲット要素が見つかりません: ${targetSelector}`);
                return;
            }

            switch (insertPosition) {
                case 'append':
                    target.insertAdjacentHTML('beforeend', html);
                    break;
                case 'prepend':
                    target.insertAdjacentHTML('afterbegin', html);
                    break;
                case 'before':
                    target.insertAdjacentHTML('beforebegin', html);
                    break;
                case 'after':
                    target.insertAdjacentHTML('afterend', html);
                    break;
                case 'replace':
                default:
                    target.innerHTML = html;
                    break;
            }
        } catch (error) {
            console.error('パーツ読み込みエラー:', error);
        }
    }

    /**
     * 複数のパーツを一括で読み込む
     * @param {Array<{path: string, selector: string, position?: string}>} parts
     * @returns {Promise<void>}
     */
    static async loadParts(parts) {
        const promises = parts.map(part =>
            this.loadPart(part.path, part.selector, part.position || 'replace')
        );
        await Promise.all(promises);
    }

    /**
     * 標準的なWikipediaレイアウトのパーツを読み込む
     * @returns {Promise<void>}
     */
    static async loadStandardLayout() {
        await this.loadParts([
            { path: 'parts/header.html', selector: '#header-placeholder', position: 'replace' },
            { path: 'parts/sidebar.html', selector: '#sidebar-placeholder', position: 'replace' },
            { path: 'parts/article-tabs.html', selector: '#article-tabs-placeholder', position: 'replace' },
            { path: 'parts/footer.html', selector: '#footer-placeholder', position: 'replace' }
        ]);

        // パーツ読み込み後に検索機能を初期化
        this.initSearchFunction();
    }

    /**
     * 検索機能を初期化
     */
    static initSearchFunction() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchArticle();
                }
            });
        }
    }
}

/**
 * 検索機能
 */
function searchArticle() {
    const query = document.getElementById('search-input').value.toLowerCase();

    // 簡易的な検索マッピング
    const articleMap = {
        '人工知能': 'artificial_intelligence',
        'ai': 'artificial_intelligence',
        'artificial intelligence': 'artificial_intelligence',
        'ワィキペディア': 'wikipedia',
        'wikipedia': 'wikipedia'
    };

    const articleId = articleMap[query];
    if (articleId) {
        window.location.href = `?article=${articleId}`;
    } else {
        // マッピングにない場合はファイル名として直接試す
        window.location.href = `?article=${query.replace(/\s+/g, '_')}`;
    }
}

// グローバルに公開
window.PartsLoader = PartsLoader;
window.searchArticle = searchArticle;
