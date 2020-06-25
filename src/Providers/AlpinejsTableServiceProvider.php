<?php

namespace Tttstudios\AlpinejsTable\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class AlpinejsTableServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../../resources/views', 'alpinejs-table');

        Blade::include('alpinejs-table::html', 'AlpinejsTableHtml');
        Blade::include('alpinejs-table::css', 'AlpinejsTableCss');
        Blade::include('alpinejs-table::js-bundle', 'AlpinejsTableBundle');
        Blade::include('alpinejs-table::js-core', 'AlpinejsTableCore');

        /**
         * Usage:
         * php artisan vendor:publish --tag=alpinejs-table
         */
        $this->publishes(
            [
                // Assets
                __DIR__ .
                '/../../resources/js/plugins/rome-modified.js' => resource_path(
                    'js/plugins/rome-modified.js'
                ),
                __DIR__ .
                '/../../resources/js/plugins/alpinejs-table.js' => resource_path(
                    'js/plugins/alpinejs-table.js'
                ),
                __DIR__ .
                '/../../resources/sass/alpinejs-table.scss' => resource_path(
                    'sass/plugins/alpinejs-table.scss'
                ),
            ],
            'alpinejs-table'
        );
    }
}
