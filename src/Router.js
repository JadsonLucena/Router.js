class Router {

    constructor() {}

    #isURL(href) {

        try {

            return new URL(href);

        } catch (err) {

            return false;

        }

    }

}