class Router {

    constructor() {

        window.onpopstate = e => e.state && this.redirect(e.state);

    }

    #isURL(href) {

        try {

            return new URL(href);

        } catch (err) {

            return false;

        }

    }

    #loadFragments(fragments) {

        return Promise.allSettled(fragments.map(fragment => new Promise((resolve, reject) => {

            try {

                let url = this.#isURL(fragment);
                if (url) {

                    fetch(fragment, {
                        headers: {
                            'Accept': 'text/html;charset=UTF-8'
                        }
                    }).then(res => {

                        if (res.ok) {

                            res.text().then(fragment => {

                                let children = Array.from(new DOMParser().parseFromString(fragment, 'text/html').body.children);

                                children.forEach(fragment => fragment.classList.add('router-fragment'));


                                resolve(children);

                            }).catch(reject);

                        } else {

                            reject(res);

                        }

                    }).catch(reject);

                } else  {

                    let children = Array.from(new DOMParser().parseFromString(fragment, 'text/html').body.children);

                    children.forEach(fragment => fragment.classList.add('router-fragment'));


                    resolve(children);

                }

            } catch (err) {

                reject(err);

            }

        })));

    }

    #loadScripts(scripts) {

        return Promise.allSettled(scripts.map(script => new Promise((resolve, reject) => {

            try {

                let js = document.createElement('script');
                    // js.type = 'text/javascript';

                let url = this.#isURL(script);
                if (url) {

                    url.searchParams.forEach((value, key) => {

                        if (['async', 'class', 'crossorigin', 'defer', 'id', 'integrity', 'nomodule', 'referrerpolicy', 'type'].includes(key)) {

                            js.setAttribute(key, value)

                            url.searchParams.delete(key);

                        }

                    });


                    js.classList.add('router-fragment');
                    js.src = url.href;
                    js.onerror = reject;


                    resolve(js);

                } else {

                    js.className = 'router-fragment';
                    js.textContent = script;


                    resolve(js);

                }

            } catch (err) {

                reject(err);

            }

        })));

    }

    #loadStyles(styles) {

        return Promise.allSettled(styles.map(style => new Promise((resolve, reject) => {

            try {

                let url = this.#isURL(style);
                if (url) {

                    let css = document.createElement('link');

                    url.searchParams.forEach((value, key) => {

                        if (['class', 'crossorigin', 'hreflang', 'id', 'media', 'referrerpolicy', 'sizes', 'title'].includes(key)) {

                            css.setAttribute(key, value);

                            url.searchParams.delete(key);

                        }

                    });

                    css.type = 'text/css';
                    css.rel = 'stylesheet';
                    css.classList.add('router-fragment--tmp');
                    css.href = url.href;
                    css.onload = () => resolve(style);
                    css.onerror = reject;


                    document.head.append(css);

                } else {

                    let css = document.createElement('style');
                        css.className = 'router-fragment--tmp';
                        // css.type = 'text/css';
                        css.textContent = style;


                    document.head.append(css);


                    resolve(style);

                }

            } catch (err) {

                reject(err);

            }

        })));

    }

    #pageBuild(state) {

        if (state.title)
            document.title = state.title;


        if (!state.append)
            document.querySelector(state.selector).innerHTML = '';


        return Promise.all([
            this.#loadStyles(state.styles),
            this.#loadFragments(state.fragments),
            this.#loadScripts(state.scripts)
        ]).then(async ([styles, fragments, scripts]) => {

            let result = {
                styles,
                fragments: [],
                scripts: []
            };


            if (state.caller == 'redirect') {

                for (let node of document.querySelectorAll('.router-fragment')) {

                    node.remove();

                }

            }


            for (let link of document.querySelectorAll('.router-fragment--tmp')) {

                link.classList.replace('router-fragment--tmp', 'router-fragment');

            }


            fragments.forEach((children, index) => {

                if (children.status == 'fulfilled') {

                    children.value.forEach(fragment => document.querySelector(state.selector).append(fragment));

                    result.fragments.push({
                        status: children.status,
                        value: state.fragments[index]
                    });

                } else {

                    result.fragments.push(children);

                }

            });


            for (let index in scripts) {

                result.scripts.push(await new Promise(resolve => {

                    try {

                        if (scripts[index].status == 'fulfilled') {

                            if (scripts[index].value.hasAttribute('src')) {

                                scripts[index].value.onload = () => resolve({
                                    status: scripts[index].status,
                                    value: state.scripts[index]
                                });
                                scripts[index].value.onerror = err => resolve({
                                    state: 'rejected',
                                    reason: err
                                });

                                document.documentElement.append(scripts[index].value);

                            } else {

                                document.documentElement.append(scripts[index].value);

                                resolve({
                                    status: scripts[index].status,
                                    value: state.scripts[index]
                                });

                            }

                        } else {

                            resolve(scripts[index]);

                        }

                    } catch (err) {

                        resolve({
                            state: 'rejected',
                            reason: err
                        });

                    }

                }));

            }



            return result;

        });

    }

    #sanitize(state) {

        state.append = Boolean(state.append);
        state.fragments = [].concat(state.fragments).map(e => typeof e == 'string' ? e.trim() : e);
        state.scripts = [].concat(state.scripts).map(e => typeof e == 'string' ? e.trim() : e);
        state.selector = typeof state.selector == 'string' ? state.selector.trim() : state.selector;
        state.styles = [].concat(state.styles).map(e => typeof e == 'string' ? e.trim() : e);
        state.title = typeof state.title == 'string' ? state.title.trim() : state.title;

        return state;

    }

    #typeGuard(state) {

        if (state.fragments.length && state.fragments.some(fragment => !fragment || typeof fragment != 'string')) {

            throw new TypeError('Unsupported Fragments');

        } else if (state.scripts.length && state.scripts.some(script => !script || typeof script != 'string')) {

            throw new TypeError('Unsupported Scripts');

        } else if (typeof state.selector != 'string' || (state.selector && !document.querySelector(state.selector))) {

            throw new TypeError('Unsupported Selector');

        } else if (state.styles.length && state.styles.some(style => !style || typeof style != 'string')) {

            throw new TypeError('Unsupported Styles');

        } else if (typeof state.title != 'string') {

            throw new TypeError('Unsupported Title');

        } else if (state.fragments.length && !state.selector) {

            throw new SyntaxError('Required Selector');

        } else if (state.selector && !state.fragments.length) {

            throw new SyntaxError('Required Fragments');

        } else if (!state.fragments.length && !state.scripts.length && !state.styles.length && !state.selector && !state.title) {

            throw new TypeError('More arguments are needed');

        }

    }

    load({
        append = true,
        fragments = [],
        scripts = [],
        selector = '',
        styles = [],
        title = ''
    }) {

        let state = this.#sanitize({ append, fragments, scripts, selector, styles, title });

        this.#typeGuard(state);

        return this.#pageBuild(Object.assign({ caller: 'load' }, state));

    }

    redirect({
        append = false,
        fragments = [],
        path = '',
        scripts = [],
        selector = '',
        styles = [],
        title = document.title
    } = {}) {

        if (typeof path != 'string') {

            throw new TypeError('Unsupported Path');

        } else if (!title || typeof title != 'string') {

            throw new TypeError('Unsupported Title');

        }


        let state = this.#sanitize({ append, fragments, scripts, selector, styles, title });

        this.#typeGuard(state);


        if (path) {

            history.pushState(state, title, path);

        } else {

            history.replaceState(state, title, location.href);

        }

        return this.#pageBuild(Object.assign({ caller: 'redirect'}, state ));

    }

}