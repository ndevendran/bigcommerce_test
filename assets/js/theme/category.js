import { hooks } from '@bigcommerce/stencil-utils';
import utils from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { defaultModal, modalFactory, ModalEvents } from './global/modal';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
        this.onAddAllItemsToCart();
        this.onRemoveAllItemsFromCart();
    }

    onAddAllItemsToCart() {
      $('[data-cart-all-add]').on('click', event => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", this.context.products[0]['add_to_cart_url']);
        xmlHttp.onload = function() {

        }
        xmlHttp.send(null);
      });
    }

    onRemoveAllItemsFromCart() {
      $('[data-cart-all-remove]').on('click', event => {
        if(this.context.cartId){
          var xmlHttp = new XMLHttpRequest();

          xmlHttp.open("DELETE", '/api/storefront/carts/'+this.context.cartId)
          xmlHttp.onload = function() {
            const modal = defaultModal();
            this.$modal = $('#modal');
            this.$modal.one(ModalEvents.close, () => {
              window.location.reload();
            });
            this.$modal.css("height", "25%");
            this.$modal.css("width", "25%");
            modal.open();

            modal.updateContent(
              '<div class="modal-body" style="text-align:center; padding-top: 20%"><p>'
              + 'All items have been removed from your cart</p>'
              +'<div><button class="button button-primary" data-special-item-modal style="margin:auto"'
              +'>'
              +'OK</button></div></div>');

            $('[data-special-item-modal]').on('click', event => {
              modal.close();
            });
          }
          xmlHttp.send(null);
          this.context.cartId = null;
        }
      })
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }
}
