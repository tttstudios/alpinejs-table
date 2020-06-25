<div x-data='AlpinejsTablePlugin(@json($collection), @json($options??[]))' x-init="init()">

    <!--if no data-->
    <div x-show="ready && !Object.keys(headers).length" class="bg-white py-32 overflow-hidden shadow text-center">
        <h3 class='alpinejs-table-not-found'>
            {{$options['placeholder']['all'] ?? 'No data'}}
        </h3>
    </div>

    <!--if has data-->
    <template x-if="ready && Object.keys(headers).length">
        <div class="alpinejs-table-container">
            <div class="alpinejs-table-layout">
                <table>
                    <!--table header-->
                    <thead>
                        <tr>
                            <template x-for="[key, header] in Object.entries(headers).filter(r=>r[1].visible)" :key="key">
                                <th :style="'width:'+options.cellWidth(key)">
                                    <div>
                                        <!-- title -->
                                        <strong x-text="header.title"></strong>

                                        <!--if sortable, show sort button-->
                                        <button x-show="header.sortable" class="alpinejs-table-sort-button" :data-type="key" @click="sort(header)">

                                            <!--sort icon: desc-->
                                            <svg :class="{'active': header.sort_order=='desc', 'none':header.sort_order=='none'}" viewBox="0 0 9 13">
                                                <path fill="currentColor" fill-rule="evenodd" d="M.136 8.76c-.181-.184-.181-.472 0-.656.174-.177.464-.177.639 0l3.27 3.322V.466c0-.257.201-.466.451-.466.252 0 .458.21.458.465v10.96l3.265-3.32c.18-.178.473-.178.646 0 .18.183.18.471 0 .654L4.82 12.867c-.175.177-.465.177-.64 0L.137 8.759z" />
                                            </svg>

                                            <!--sort icon: asc-->
                                            <svg :class="{'active': header.sort_order=='asc', 'none':header.sort_order=='none'}" viewBox="0 0 9 13">
                                                <path fill="currentColor" fill-rule="evenodd" d="M.136 4.24c-.181.184-.181.472 0 .656.174.177.464.177.639 0l3.27-3.322v10.96c0 .257.201.466.451.466.252 0 .458-.21.458-.465V1.575l3.265 3.32c.18.178.473.178.646 0 .18-.183.18-.471 0-.654L4.82.133c-.175-.177-.465-.177-.64 0L.137 4.241z" />
                                            </svg>
                                        </button>
                                    </div>


                                    <!-- filter by text match -->
                                    <template x-if="header.filter_type=='text'">
                                        <div class="alpinejs-table-filter-text" :data-type="key">

                                            <!--Input-->
                                            <input type="text" @keyup="filter(key)" placeholder="Search" x-model="typingKeywords[key]" :key="header.filter_type+key" />

                                            <!--Clean this keyword-->
                                            <button @click="typingKeywords[key]='';filter(key)" x-show="!isEmpty(key)">
                                                <!-- X Icon-->
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>

                                        </div>
                                    </template>


                                    <!-- filter by date picker -->
                                    <template x-if="header.filter_type=='date'">
                                        <div class="alpinejs-table-filter-date" :data-type="key">

                                            <!--Input-->
                                            <input type="text" @change="filter(key)" @click.stop="header.datepicker.show()" :id="'date-picker-'+key" placeholder="Search" x-model="typingKeywords[key]" :key="header.filter_type+key" readonly />

                                            <!--Calendar icon-->
                                            <svg viewBox="0 0 24 24" @click.stop="header.datepicker.show()">
                                                <path fill="currentColor" fill-rule="evenodd" d="M21.583 4.667h-2.916v-1.25c0-.23-.187-.417-.417-.417-.23 0-.417.187-.417.417v1.25H14.5v-1.25c0-.23-.187-.417-.417-.417-.23 0-.416.187-.416.417v1.25h-3.334v-1.25c0-.23-.186-.417-.416-.417-.23 0-.417.187-.417.417v1.25H6.167v-1.25c0-.23-.187-.417-.417-.417-.23 0-.417.187-.417.417v1.25H2.417c-.23 0-.417.186-.417.416v15.834c0 .23.187.416.417.416h19.166c.23 0 .417-.186.417-.416V5.083c0-.23-.187-.416-.417-.416zM21.167 20.5H2.833V8.833h18.334V20.5zm0-12.5H2.833V5.5h2.5v.417c0 .23.187.416.417.416.23 0 .417-.186.417-.416V5.5H9.5v.417c0 .23.187.416.417.416.23 0 .416-.186.416-.416V5.5h3.334v.417c0 .23.186.416.416.416.23 0 .417-.186.417-.416V5.5h3.333v.417c0 .23.187.416.417.416.23 0 .417-.186.417-.416V5.5h2.5V8z" />
                                            </svg>

                                            <!--Clean this keyword-->
                                            <button @click="typingKeywords[key]='';filter(key)" x-show="!isEmpty(key)">
                                                <!-- X Icon-->
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </template>


                                    <!-- filter by dropdown select -->
                                    <template x-if="header.filter_type=='dropdown'">
                                        <div class="alpinejs-table-filter-dropdown" :data-type="key" @keyup.window.escape="dropdownClose(header)" @click.away="dropdownClose(header)">
                                            <div>
                                                <span>
                                                    <!--Dropdown trigger button-->
                                                    <button @click="dropdownToggle(header)" :class="{'active': typingKeywords[key]!=''}" type="button">
                                                        <span x-text="typingKeywords[key]==''?'Select':typingKeywords[key]"></span>
                                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </div>

                                            <!--Dropdown pop up options-->
                                            <div x-show="header.filter_active" class='dropdown-options'>
                                                <template x-for="option in header.dropdowns" :key="key+option">
                                                    <button :data-type="option" @click="typingKeywords[key]=option;dropdownClose(header);filter(key);" x-text="option==''?'All':option" :class="{'active': typingKeywords[key]==option}"></button>
                                                </template>
                                            </div>
                                        </div>


                                    </template>


                                    <!-- if no filter needed, use placeholder to be aligned to top -->
                                    <template x-if="header.filter_type=='none'">
                                        <div class="alpinejs-table-filter-text" class='opacity-0'>
                                            <input class='opacity-0' />
                                        </div>
                                    </template>

                                </th>
                            </template>
                        </tr>
                    </thead>

                    <!--table body-->
                    <tbody>

                        <tr x-show="!currentData.length">
                            <td :colspan="Object.keys(headers).length" class='block'>
                                <div class="bg-white text-center py-20 w-full text-gray-500">
                                    <h3 class='alpinejs-table-not-found text-center'>
                                        {{$options['placeholder']['filtered'] ?? 'No results based on your filters'}}
                                    </h3>

                                </div>
                            </td>
                        </tr>

                        <!--loop & display each row -->
                        <template x-for="(row,index) in currentData" :key="index">
                            <tr>
                                <!--loop each cell (e.g. first_name) in currentData-->
                                <template x-for="[key, cell] in Object.entries(row).filter(r=>headers[r[0]].visible)"  :key="key">
                                    <td :data-type="key" :style="'width:'+options.cellWidth(key)">

                                        <!-- if has text link -->
                                        <span x-html="options.cellRenderer(key, cell, row)">
                                        </span>

                                    </td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination -->
        <div class="alpinejs-table-pagination">
            <div class="w-0 flex-1 flex text-xs text-gray-500">
                Showing &nbsp;<span x-text="filteredData.length?startIndex+1:0"></span>&nbsp; to &nbsp;<span x-text="endIndex"></span>&nbsp; of &nbsp;<span x-text="filteredData.length"></span>&nbsp; entries
            </div>
            <div class="flex items-center">
                <button @click="loadPage(currentPage-1)" class="prev-btn" :disabled="currentPage==1">
                    Previous
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <template x-for="page in pageNumbers()" :key="'page_'+page">
                    <button @click="loadPage(page)" :disabled="page=='...'" :class="{'number-btn':true, 'active': page==currentPage }" type='button'>
                        <span x-text="page"></span>
                    </button>
                </template>
                <button @click="loadPage(currentPage+1)" class="next-btn" :disabled="currentPage==totalPages">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    Next
                </button>
            </div>
            <div class="w-0 flex-1 flex text-xs justify-end text-gray-800 items-center">
                Show
                <select @change.debounce.100ms="changePerPage" class='select-perpage'>
                    <template x-for="perPage in options.perPageOptions" :key="'per_page_'+perPage">
                        <option :value="perPage" x-text="perPage"></option>
                    </template>
                </select>
                entries
            </div>
        </div>

    </template>
</div>
