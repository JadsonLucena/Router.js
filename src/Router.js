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

}