const moment = require("moment");

const rome = require("./rome-modified.js");

/**
 * Create x-data for alpine.js
 *
 * @param  {Array}  collection [Pass from Laravel]
 * @param  {Object} options    [Pass from Laravel]
 * @return {object}            [To be injected into x-data in blade view]
 */
export default (collection = [], options = {}) => {
    return {
        ready: false,

        // options:
        options: {},

        // all table data
        allData: [],

        // filtered data
        filteredData: [],

        // data showing in current page
        currentData: [],

        // table headers:
        headers: {},

        // keywords that's being typed or selected (not applied yet)
        typingKeywords: {},

        // keywords that are actually applied for filtering:
        appliedKeywords: {},

        // pagination params:
        currentPage: 1, //current page num
        totalPages: 1, // tatal pages
        startIndex: 1,
        endIndex: 50,


        /**
         * Public function
         *
         * Initialize data
         *
         * usage: x-init="init()"
         * @return {Void}
         */
        init: async function () {
            const defaultOptions = {
                dateFormat: "MMM D, YYYY",
                perPage: 10,
                visiblePages: 8,
                notSortable: [],
                notFilterable: [],
                matchFromLeft: [],
                notVisible: [],
                dropdowns: [],
                dates: [],
                specificWidths: {},
                perPageOptions: [10, 50, 100],
                "titleRenderer(key)": `return undefined`,
                "cellWidth(key)": `return '200px'`,
                "cellRenderer(key,cell,row)": `return cell.value`,
            };

            this.options = { ...defaultOptions, ...options };

            this.options.titleRenderer = new Function(
                "key",
                this.options["titleRenderer(key)"]
            );
            this.options.cellWidth = new Function(
                "key",
                this.options["cellWidth(key)"]
            );
            this.options.cellRenderer = new Function(
                "key",
                "cell",
                "row",
                this.options["cellRenderer(key,cell,row)"]
            );

            // format data:
            this.allData = await this._formatTextAndActions(collection);

            // initial state: no filter
            this.filteredData = await this.allData;

            // parse table headers:
            this.headers = await this._parseTableHeaders(this.allData);

            // initialize empty keywords object, e.g. {name: '', email:''}
            this.typingKeywords = await Object.assign(
                {},
                ...Object.keys(this.headers).map((key) => {
                    const defaultKeyword =
                        this.headers[key].filter_type == "dropdown" &&
                        this.headers[key].dropdowns.length == 1
                            ? this.headers[key].dropdowns[0]
                            : "";
                    return {
                        [key]: defaultKeyword,
                    };
                })
            );

            // copy to appliedKeywords for initialization:
            this.appliedKeywords = Object.assign({}, this.typingKeywords);

            // calculate total pages:
            this.totalPages = Math.max(
                1,
                Math.ceil(collection.length / this.options.perPage)
            );

            //show first page:
            this.loadPage(1);

            this.ready = true;

            let root = this;
            // initialize date pickers after alpine renders all elements
            setTimeout(() => {
                Object.keys(this.headers).forEach((key) => {
                    if (this.headers[key].filter_type == "date") {
                        this.headers[key].datepicker = rome(
                            document.querySelector("#date-picker-" + key),
                            {
                                time: false,
                                required: false,
                                dayFormat: "D",
                                inputFormat: this.options.dateFormat,
                            }
                        ).on("data", function (value) {
                            root.typingKeywords[key] = value;
                            root.filter(key);
                        });
                    }
                });
            }, 500);
        },

        /**
         * Public function
         *
         * Change perPage value and reload first page
         *
         * @return Void
         */
        changePerPage: function (e) {
            this.options.perPage = parseInt(e.target.value);

            // calculate total pages:
            this.totalPages = Math.max(
                1,
                Math.ceil(this.filteredData.length / this.options.perPage)
            );

            //show first page:
            this.loadPage(1);
        },


        /**
         * Public function
         *
         * Close dropdown menu for one header
         *
         * Usage: @click.away="dropdownClose(header)"
         *
         * @param  {Object} header
         * @return void
         */
        dropdownClose: function (header = {}) {
            header.filter_active = false;
        },


        /**
         * Public function
         *
         * Toggle dropdown menu for one header
         *
         * Usage: @click="dropdownToggle(header)"
         *
         * @param  {Object} header
         * @return void
         */
        dropdownToggle: function (header = {}) {
            header.filter_active = !header.filter_active;
        },

        /**
         * Public function
         *
         * Load and display data for one page only
         *
         * Usage: @click="loadPage(page)"
         *
         * @param  {Number} num
         * @return {Void}
         */
        loadPage: function (num = 1) {
            this.currentPage = Math.min(Math.max(1, num), this.totalPages);

            this.startIndex = (this.currentPage - 1) * this.options.perPage;
            this.endIndex = Math.min(
                this.filteredData.length,
                this.startIndex + this.options.perPage
            );

            this.currentData = this.filteredData.slice(
                this.startIndex,
                this.endIndex
            );
        },

        /**
         * Public function
         *
         * Check if one field has keyword or dropdown menu selected
         *
         * @param  {String} key
         * @return {Bool}
         */
        isEmpty: function (key = "") {
            return !(
                this.typingKeywords[key] && this.typingKeywords[key].length
            );
        },

        /**
         * Public function
         *
         * Filter all rows by multiple header's keywords or dropdowns
         *
         * Usage: @keydown.debounce.100ms=" filter(key)"
         *
         * @param  {String} key
         * @return {Void}
         */

        filter: async function (key = "") {
            if (this.typingKeywords[key] == this.appliedKeywords[key])
                return false;

            // Pass the typing keyword to actual keyword:
            this.appliedKeywords[key] = this.typingKeywords[key];

            this.filteredData = await this._matchDataWithKeywords(
                this.headers,
                this.allData,
                this.appliedKeywords
            );

            this.totalPages = Math.max(
                1,
                Math.ceil(this.filteredData.length / this.options.perPage)
            );

            //show first page after filtered:
            this.loadPage(1);
        },

        /**
         * Public function
         *
         * Sort all rows by one header and reset other headers' sort_order
         *
         * Usage: @click="sort(header)"
         *
         * @param  {Object} header (e.g. {id:1, key: "name", sort_order: "asc"} )
         * @return {Void}
         */
        sort: function (header = {}) {
            //toggle sort order:
            header.sort_order = header.sort_order != "asc" ? "asc" : "desc";

            //sort all data
            this.filteredData.sort(
                this._sortValueComparison(header.key, header.sort_order)
            );

            // reset sort_order for other headers
            Object.keys(this.headers).forEach((key) => {
                if (key != header.key) this.headers[key].sort_order = "none";
            });

            // Go to first page after all data sorted
            this.loadPage(1);
        },

        /**
         * Public function
         *
         * Calculate an array of page numbers and ellipsis for pagination area
         *
         * Usage: x-for="(page,index) in pageNumbers()"
         *
         * @return {Array} [E.g., 1,2,3...8,9,10]
         */
        pageNumbers: function () {
            /**
             * Important
             * BUG:  Alpine does not bind listeners to dynamic generated DOM elements
             * Need to remove old element and manually bind
             */
            document.querySelectorAll(".number-btn").forEach((el) => {
                el.remove();
            });
            setTimeout(() => {
                window.Alpine.listenForNewUninitializedComponentsAtRunTime();
            }, 20);

            const allPages = Array.from(Array(this.totalPages).keys()).map(
                (num) => num + 1
            );

            if (this.totalPages <= this.options.visiblePages) return allPages;

            let halfVisible = Math.ceil(this.options.visiblePages / 2);

            // if current page num is near the start
            if (this.currentPage < Math.max(4, halfVisible - 1)) {
                const leftEnd = Math.max(halfVisible, this.currentPage + 1);

                return [
                    ...allPages.slice(0, leftEnd), //e.g: 1,2,3
                    ...["..."], //ellipsis
                    ...allPages.slice(
                        0 - (this.options.visiblePages - leftEnd)
                    ), //e.g.: 8,9,10
                ];
            }

            // if current page num is near the end
            if (this.currentPage > this.totalPages - halfVisible) {
                const rightStart = Math.min(
                    this.totalPages - halfVisible,
                    this.currentPage - 1
                );

                return [
                    ...allPages.slice(
                        0,
                        this.options.visiblePages -
                            (this.totalPages - rightStart) -
                            1
                    ), //e.g: 1,2,3
                    ...["..."], //ellipsis
                    ...allPages.slice(rightStart - 1), //e.g.: 8,9,10
                ];
            }

            // if current page num is in the middle:
            const leftStart = Math.max(3, this.currentPage - (halfVisible - 1));
            const rightEnd = Math.min(
                this.totalPages - 2,
                this.currentPage + halfVisible
            );
            return [
                ...[1, "..."], //e.g.: 1, ...
                ...allPages.slice(leftStart - 1, rightEnd - 1), //e.g.: 4,5,6,7
                ...["...", this.totalPages], //e.g.: ... 10
            ];

            return allPages;
        },

        /**
         * Private function
         *
         * Check if a string is numeric (1.23 or "1.23" or 123 or "123")
         *
         * @param  {String}  n
         * @return {Boolean}
         */
        _isNumeric: function (n = "") {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        /**
         * Private function
         *
         * Return a sorting closure to compare a certain value (e.g. first_name) in 2 row objects
         *
         * @param  {String} key
         * @param  {String} sort_order
         * @return {Function}
         */
        _sortValueComparison: function (key = "", sort_order = "asc") {
            let root = this;

            return function innerSort(obj1, obj2) {
                if (!obj1.hasOwnProperty(key) || !obj2.hasOwnProperty(key)) {
                    return 0;
                }

                const varA = root._isNumeric(obj1[key].rawValue)
                    ? Number(obj1[key].rawValue)
                    : obj1[key].rawValue.toUpperCase();
                const varB = root._isNumeric(obj2[key].rawValue)
                    ? Number(obj2[key].rawValue)
                    : obj2[key].rawValue.toUpperCase();

                let comparison = 0;

                if (varA > varB) comparison = 1;
                else if (varA < varB) comparison = -1;

                return sort_order === "desc" ? comparison * -1 : comparison;
            };
        },

        /**
         * Private function
         *
         * Get all the keys in first row and create headers object
         *
         * @param  {Array}  data
         * @return {Object}
         */
        _parseTableHeaders: function (data = []) {
            if (!data.length) return {};

            let headers = {};

            let dropdowns = {};
            let datepickers = [];

            // Get headers from the first row:
            Object.keys(data[0]).forEach((key) => {
                headers[key] = {
                    key: key, //e.g. first_name
                    title:
                        this.options.titleRenderer(key) || this._titleCase(key), //e.g. First Name
                    visible: !this.options.notVisible.includes(key),
                    sortable: !this.options.notSortable.includes(key), // if show sort button
                    sort_order: "none", // e.g.: asc, desc; by default: none
                    filter_type: this._getFilterType(key),
                    dropdowns: [], // if filter_type='dropdown', need to fill this with all options
                    datepicker: null, // only for [date] type
                    filter_active: false, // when filter_active=true, dropdown menu shows
                };

                if (headers[key].filter_type == "dropdown") {
                    dropdowns[key] = [];
                }
            });

            // Loop all data to collect dropdown options:
            if (Object.keys(dropdowns).length) {
                Object.keys(dropdowns).forEach((key) => {
                    dropdowns[key].push(""); //default value

                    data.forEach((row) => {
                        if (!dropdowns[key].includes(row[key].rawValue))
                            dropdowns[key].push(row[key].rawValue);
                    });

                    // Simplify dropdown menus when there is only 1 option available:
                    headers[key].dropdowns =
                        dropdowns[key].length == 2
                            ? [dropdowns[key][1]]
                            : [...dropdowns[key]];
                });
            }

            return headers;
        },

        /**
         * Private function
         *
         * @param  {String} key
         * @return {String}
         */
        _getFilterType: function (key = "") {
            if (this.options.notFilterable.includes(key)) return "none";

            if (this.options.dropdowns.includes(key)) return "dropdown";

            if (this.options.dates.includes(key)) return "date";

            return "text";
        },

        /**
         * Private function
         *
         * Escape html tags in text & Convert [actions] into html (1 or more buttons)
         *
         * @param  {Array}  data
         * @return {Array}
         */
        _formatTextAndActions: function (data = []) {
            let newData = [];
            data.forEach((obj) => {
                let newObj = {};

                Object.keys(obj).forEach((key) => {
                    newObj[key] = {
                        rawValue: this._escape(obj[key]),
                    };

                    if (this.options.dates.includes(key))
                        newObj[key].rawValue = moment(newObj[key].rawValue)
                            .local()
                            .format(this.options.dateFormat);

                    // initialize: highlighted = value
                    newObj[key].value = newObj[key].rawValue;
                });

                newData.push(newObj);
            });
            return newData;
        },

        /**
         * Private function
         *
         * Convert key to title
         *
         * Input example: 'first_name'
         *
         * Output example: 'First Name'
         *
         * @param  {String} str
         * @return {String}
         */
        _titleCase: function (str = "") {
            str = str.split("_");
            for (let i = 0; i < str.length; i++) {
                str[i] = str[i]
                    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                        return " " + word.toUpperCase();
                    })
                    .trim();
            }
            return str.join(" ").trim();
        },

        /**
         * Private function
         *
         * Clean html tags
         *
         * Input example: '<hr />'
         *
         * Output example: '&lt;hr /&gt;'
         *
         * @param  {String} str
         * @return {String}
         */
        _escape: function (word = "") {
            if (!word) return "";
            return word
                .toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        /**
         * Private function
         *
         * Compare each data in each row and only return results that matches all keywords
         *
         * @param  {Object} headers
         * @param  {Array}  allData
         * @param  {Object} keywords
         * @return {[type]}
         */
        _matchDataWithKeywords: function (
            headers = {},
            allData = [],
            keywords = {}
        ) {
            let filtered = [];

            allData.forEach((row) => {
                let obj = Object.assign({}, row);

                let allFieldMatch = true;
                Object.entries(keywords).forEach(([key, rawWord]) => {
                    const word = this._escape(rawWord);

                    let oneFieldMatch =
                        word == "" || // if keyword is empty => match
                        obj[key].rawValue.toLowerCase() == word.toLowerCase(); // if same => match

                    if (!oneFieldMatch && headers[key].filter_type == "text") {
                        let haystack = obj[key].rawValue.toLowerCase();
                        let needle = word.toLowerCase();

                        if (
                            this.options.matchLettersOnly &&
                            this.options.matchFromLeft.includes(key)
                        ) {
                            haystack = haystack.replace(/[^0-9a-zA-Z]/gi, "");
                            needle = needle.replace(/[^0-9a-zA-Z]/gi, "");
                        }

                        if (
                            this.options.matchFromLeft &&
                            this.options.matchFromLeft.includes(key)
                        ) {
                            oneFieldMatch =
                                haystack.substr(0, needle.length) == needle;
                        } else {
                            oneFieldMatch = haystack.includes(needle);
                        }
                    }

                    if (!oneFieldMatch) {
                        allFieldMatch = false;
                    } else {
                        // if filter by text and contains keyword, then highlight:
                        if (headers[key].filter_type == "text")
                            obj[key].value = this._highlightKeyword(
                                obj[key].rawValue,
                                word
                            );
                    }
                });

                if (allFieldMatch) filtered.push(obj);
            });
            return filtered;
        },

        /**
         * Private function
         *
         * Highlight keyword in a string.
         *
         * Input example: fullStr="Tom has a phone with him", word="phone"
         *
         * Output example: Tom has a <span class="font-bold">phone</span> with him
         *
         * @param  {String} haystack
         * @param  {String} needle
         * @return {String}
         */
        _highlightKeyword: function (haystack = "", needle = "") {
            if (needle == "") return haystack;
            return haystack.replace(
                new RegExp(needle, "gi"),
                (str) => '<span class="font-bold">' + str + "</span>"
            );
        },
    };
};
