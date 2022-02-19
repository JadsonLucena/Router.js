class Router {

    constructor() {}

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

}