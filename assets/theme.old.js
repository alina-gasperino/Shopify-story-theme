
/*
* @license
* Story Theme (c) Groupthought Themes
*
* The contents of this file should not be modified.
* add any minor changes to assets/custom.js
*
*/

(function (bodyScrollLock, FlickityFade, themeCurrency, themeAddresses, Sqrl, axios, MicroModal, Flickity, Rellax, FlickitySync) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var Sqrl__namespace = /*#__PURE__*/_interopNamespaceDefault(Sqrl);

  window.theme = window.theme || {};
  window.theme.sizes = {
      small: 480,
      medium: 768,
      large: 990,
      widescreen: 1400
  };
  window.theme.keyboardKeys = {
      TAB: 9,
      ENTER: 13,
      ESCAPE: 27,
      SPACE: 32,
      LEFTARROW: 37,
      RIGHTARROW: 39
  };

  function debounce(fn, wait) {
      let t;
      return (...args)=>{
          clearTimeout(t);
          t = setTimeout(()=>fn.apply(this, args)
          , wait);
      };
  }

  let lastWidth = window.innerWidth;
  function dispatch$1() {
      document.dispatchEvent(new CustomEvent('theme:resize', {
          bubbles: true
      }));
      if (window.innerWidth != lastWidth) {
          document.dispatchEvent(new CustomEvent('theme:resize:width', {
              bubbles: true
          }));
          lastWidth = window.innerWidth;
      }
  }
  function resizeListener() {
      window.addEventListener('resize', debounce(function() {
          dispatch$1();
      }, 50));
  }

  let prev = window.pageYOffset;
  let up = null;
  let down = null;
  let wasUp = null;
  let wasDown = null;
  let scrollLockTimeout = 0;
  function dispatch() {
      const position = window.pageYOffset;
      if (position > prev) {
          down = true;
          up = false;
      } else if (position < prev) {
          down = false;
          up = true;
      } else {
          up = null;
          down = null;
      }
      prev = position;
      document.dispatchEvent(new CustomEvent('theme:scroll', {
          detail: {
              up,
              down,
              position
          },
          bubbles: false
      }));
      if (up && !wasUp) {
          document.dispatchEvent(new CustomEvent('theme:scroll:up', {
              detail: {
                  position
              },
              bubbles: false
          }));
      }
      if (down && !wasDown) {
          document.dispatchEvent(new CustomEvent('theme:scroll:down', {
              detail: {
                  position
              },
              bubbles: false
          }));
      }
      wasDown = down;
      wasUp = up;
  }
  function lock(e) {
      let element = e.target;
      if (e.detail && e.detail instanceof Element) {
          element = e.detail;
      }
      bodyScrollLock.disableBodyScroll(element);
      document.documentElement.setAttribute('data-scroll-locked', '');
  }
  function unlock() {
      // Prevent body scroll lock race conditions
      scrollLockTimeout = setTimeout(()=>{
          document.body.removeAttribute('data-drawer-closing');
      }, 20);
      if (document.body.hasAttribute('data-drawer-closing')) {
          document.body.removeAttribute('data-drawer-closing');
          if (scrollLockTimeout) {
              clearTimeout(scrollLockTimeout);
          }
          return;
      } else {
          document.body.setAttribute('data-drawer-closing', '');
      }
      document.documentElement.removeAttribute('data-scroll-locked');
      bodyScrollLock.clearAllBodyScrollLocks();
  }
  function scrollListener() {
      let timeout;
      window.addEventListener('scroll', function() {
          if (timeout) {
              window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(function() {
              dispatch();
          });
      }, {
          passive: true
      });
      window.addEventListener('theme:scroll:lock', lock);
      window.addEventListener('theme:scroll:unlock', unlock);
  }

  function moveModals(container) {
      const modals = container.querySelectorAll('[data-modal]');
      const modalBin = document.querySelector('[data-modal-container]');
      modals.forEach((element)=>{
          const alreadyAdded = modalBin.querySelector(`[id="${element.id}"]`);
          if (!alreadyAdded) {
              modalBin.appendChild(element);
          } else {
              element.parentNode.removeChild(element);
          }
      });
  }

  function floatLabels(container) {
      const floats = container.querySelectorAll('.form__field');
      floats.forEach((element)=>{
          const label = element.querySelector('label');
          const input = element.querySelector('input, textarea');
          if (label && input) {
              input.addEventListener('keyup', (event)=>{
                  if (event.target.value !== '') {
                      label.classList.add('label--float');
                  } else {
                      label.classList.remove('label--float');
                  }
              });
          }
          if (input && input.value && input.value.length) {
              label.classList.add('label--float');
          }
      });
  }
  function errorTabIndex(container) {
      const errata = container.querySelectorAll('.errors');
      errata.forEach((element)=>{
          element.setAttribute('tabindex', '0');
          element.setAttribute('aria-live', 'assertive');
          element.setAttribute('role', 'alert');
      });
  }

  function readHeights() {
      const h = {};
      h.windowHeight = window.innerHeight;
      h.announcementHeight = getHeight('#shopify-section-announcement');
      h.footerHeight = getHeight('[data-section-type*="footer"]');
      h.menuHeight = getHeight('[data-header-height]');
      h.headerHeight = h.menuHeight + h.announcementHeight;
      h.logoHeight = getFooterLogoWithPadding();
      return h;
  }
  function setVarsOnResize() {
      document.addEventListener('theme:resize', resizeVars);
      setVars();
  }
  function setVars() {
      const { windowHeight , announcementHeight , headerHeight , logoHeight , menuHeight , footerHeight  } = readHeights();
      document.documentElement.style.setProperty('--full-screen', `${windowHeight}px`);
      document.documentElement.style.setProperty('--three-quarters', `${windowHeight * 0.75}px`);
      document.documentElement.style.setProperty('--two-thirds', `${windowHeight * 0.66}px`);
      document.documentElement.style.setProperty('--one-half', `${windowHeight * 0.5}px`);
      document.documentElement.style.setProperty('--one-third', `${windowHeight * 0.33}px`);
      document.documentElement.style.setProperty('--one-fifth', `${windowHeight * 0.2}px`);
      document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
      document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
      document.documentElement.style.setProperty('--scrollbar-width', `${window.innerWidth - document.documentElement.clientWidth}px`);
  }
  function resizeVars() {
      // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
      const { windowHeight , announcementHeight , headerHeight , logoHeight , menuHeight , footerHeight  } = readHeights();
      document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
      document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
  }
  function getHeight(selector) {
      const el = document.querySelector(selector);
      if (el) {
          return el.clientHeight;
      } else {
          return 0;
      }
  }
  function getFooterLogoWithPadding() {
      const height = getHeight('[data-footer-logo]');
      if (height > 0) {
          return height + 20;
      } else {
          return 0;
      }
  }

  function singles(frame, wrappers) {
      // sets the height of any frame passed in with the
      // tallest js-overflow-content as well as any image in that frame
      let padding = 64;
      let tallest = 0;
      wrappers.forEach((wrap)=>{
          if (wrap.offsetHeight > tallest) {
              const getMarginTop = parseInt(window.getComputedStyle(wrap).marginTop);
              const getMarginBottom = parseInt(window.getComputedStyle(wrap).marginBottom);
              const getMargin = getMarginTop + getMarginBottom;
              if (getMargin > padding) {
                  padding = getMargin;
              }
              tallest = wrap.offsetHeight;
          }
      });
      const images = frame.querySelectorAll('[data-overflow-background]');
      const frames = [
          frame,
          ...images
      ];
      frames.forEach((el)=>{
          el.style.setProperty('min-height', `calc(${tallest + padding}px + var(--menu-height))`);
      });
  }
  function doubles(section) {
      if (window.innerWidth < window.theme.sizes.medium) {
          // if we are below the small breakpoint, the double section acts like two independent
          // single frames
          let singleFrames = section.querySelectorAll('[data-overflow-frame]');
          singleFrames.forEach((singleframe)=>{
              const wrappers = singleframe.querySelectorAll('[data-overflow-content]');
              singles(singleframe, wrappers);
          });
          return;
      }
      const padding = parseInt(getComputedStyle(section).getPropertyValue('--outer')) * 2;
      let tallest = 0;
      const frames = section.querySelectorAll('[data-overflow-frame]');
      const contentWrappers = section.querySelectorAll('[data-overflow-content]');
      contentWrappers.forEach((content)=>{
          if (content.offsetHeight > tallest) {
              tallest = content.offsetHeight;
          }
      });
      const images = section.querySelectorAll('[data-overflow-background]');
      let applySizes = [
          ...frames,
          ...images
      ];
      applySizes.forEach((el)=>{
          el.style.setProperty('min-height', `${tallest + padding}px`);
      });
      section.style.setProperty('min-height', `${tallest + padding}px`);
  }
  function preventOverflow(container) {
      const singleFrames = container.querySelectorAll('.js-overflow-container');
      if (singleFrames) {
          singleFrames.forEach((frame)=>{
              const wrappers = frame.querySelectorAll('.js-overflow-content');
              singles(frame, wrappers);
              document.addEventListener('theme:resize', ()=>{
                  singles(frame, wrappers);
              });
          });
          // Reload slides if container has slideshow
          const slideshows = container.querySelectorAll('[data-slideshow-wrapper]');
          if (slideshows.length) {
              slideshows.forEach((slideshow)=>{
                  const slideshowInstance = FlickityFade.data(slideshow);
                  if (typeof slideshowInstance !== 'undefined') {
                      slideshowInstance.reloadCells();
                  }
              });
          }
      }
      const doubleSections = container.querySelectorAll('[data-overflow-wrapper]');
      if (doubleSections) {
          doubleSections.forEach((section)=>{
              doubles(section);
              document.addEventListener('theme:resize', ()=>{
                  doubles(section);
              });
          });
      }
  }

  resizeListener();
  scrollListener();
  window.addEventListener('load', ()=>{
      setVarsOnResize();
      floatLabels(document);
      errorTabIndex(document);
      moveModals(document);
      preventOverflow(document);
  });
  document.addEventListener('shopify:section:load', (e)=>{
      document.dispatchEvent(new CustomEvent('theme:header:check', {
          bubbles: false
      }));
      const container = e.target;
      floatLabels(container);
      errorTabIndex(container);
      moveModals(container);
      preventOverflow(container);
  });
  document.addEventListener('shopify:section:reorder', ()=>{
      document.dispatchEvent(new CustomEvent('theme:header:check', {
          bubbles: false
      }));
  });

  const selectors$T = {
      templateAddresses: '.template-addresses',
      addressNewForm: '#AddressNewForm',
      btnNew: '[data-btn-address-toggle]',
      btnEdit: '[data-btn-address-edit-toggle]',
      btnDelete: '[data-btn-address-delete]',
      addressCountrySelect: '[data-country-select]',
      defaultConfirmMessage: 'Are you sure you wish to delete this address?',
      editAddress: '#EditAddress',
      dataFormId: 'data-form-id',
      addressCountryNew: 'AddressCountryNew',
      addressProvinceNew: 'AddressProvinceNew',
      addressProvinceContainerNew: 'AddressProvinceContainerNew',
      addressCountry: 'AddressCountry',
      addressProvince: 'AddressProvince',
      addressProvinceContainer: 'AddressProvinceContainer'
  };
  const classes$s = {
      hide: 'hide'
  };
  let Addresses = class Addresses {
      events() {
          if (this.newButtons.length) {
              this.newButtons.forEach((element)=>{
                  element.addEventListener('click', ()=>{
                      this.addressNewForm.classList.toggle(classes$s.hide);
                  });
              });
          }
          if (this.editButtons.length) {
              this.editButtons.forEach((element)=>{
                  element.addEventListener('click', ()=>{
                      const formId = element.getAttribute(selectors$T.dataFormId);
                      this.section.querySelector(`${selectors$T.editAddress}_${formId}`).classList.toggle(classes$s.hide);
                  });
              });
          }
          if (this.deleteButtons.length) {
              this.deleteButtons.forEach((element)=>{
                  element.addEventListener('click', ()=>{
                      const formId = element.getAttribute(selectors$T.dataFormId);
                      const confirmMessage = element.getAttribute(selectors$T.dataConfirmMessage);
                      if (confirm(confirmMessage || selectors$T.defaultConfirmMessage)) {
                          Shopify.postLink(`${theme.routes.account_addresses_url}/${formId}`, {
                              parameters: {
                                  _method: 'delete'
                              }
                          });
                      }
                  });
              });
          }
      }
      customerAddresses() {
          // Initialize observers on address selectors, defined in shopify_common.js
          if (Shopify.CountryProvinceSelector) {
              new Shopify.CountryProvinceSelector(selectors$T.addressCountryNew, selectors$T.addressProvinceNew, {
                  hideElement: selectors$T.addressProvinceContainerNew
              });
          }
          this.countrySelects.forEach((element)=>{
              const formId = element.getAttribute(selectors$T.dataFormId);
              const countrySelector = `${selectors$T.addressCountry}_${formId}`;
              const provinceSelector = `${selectors$T.addressProvince}_${formId}`;
              const containerSelector = `${selectors$T.addressProvinceContainer}_${formId}`;
              new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                  hideElement: containerSelector
              });
          });
      }
      constructor(section){
          this.section = section;
          this.addressNewForm = this.section.querySelector(selectors$T.addressNewForm);
          this.newButtons = this.section.querySelectorAll(selectors$T.btnNew);
          this.editButtons = this.section.querySelectorAll(selectors$T.btnEdit);
          this.deleteButtons = this.section.querySelectorAll(selectors$T.btnDelete);
          this.countrySelects = this.section.querySelectorAll(selectors$T.addressCountrySelect);
          if (this.addressNewForm) {
              this.customerAddresses();
              this.events();
          }
      }
  };
  document.addEventListener('DOMContentLoaded', function() {
      const accountAddressTemplate = document.querySelector(selectors$T.templateAddresses);
      if (accountAddressTemplate) {
          new Addresses(accountAddressTemplate);
      }
  });

  const selectors$S = {
      form: '[data-account-form]',
      showReset: '[data-show-reset]',
      hideReset: '[data-hide-reset]',
      recover: '[data-recover-password]',
      login: '[data-login-form]',
      recoverHash: '#recover',
      hideClass: 'hide'
  };
  let Login = class Login {
      init() {
          if (window.location.hash == selectors$S.recoverHash) {
              this.showRecoverPasswordForm();
          } else {
              this.hideRecoverPasswordForm();
          }
          this.showButton.addEventListener('click', (e)=>{
              e.preventDefault();
              this.showRecoverPasswordForm();
          });
          this.hideButton.addEventListener('click', (e)=>{
              e.preventDefault();
              this.hideRecoverPasswordForm();
          });
      }
      showRecoverPasswordForm() {
          this.login.classList.add(selectors$S.hideClass);
          this.recover.classList.remove(selectors$S.hideClass);
          window.location.hash = selectors$S.recoverHash;
          return false;
      }
      hideRecoverPasswordForm() {
          this.recover.classList.add(selectors$S.hideClass);
          this.login.classList.remove(selectors$S.hideClass);
          window.location.hash = '';
          return false;
      }
      constructor(form){
          this.showButton = form.querySelector(selectors$S.showReset);
          this.hideButton = form.querySelector(selectors$S.hideReset);
          this.recover = form.querySelector(selectors$S.recover);
          this.login = form.querySelector(selectors$S.login);
          this.init();
      }
  };
  document.addEventListener('DOMContentLoaded', function() {
      const loginForm = document.querySelector(selectors$S.form);
      if (loginForm) {
          new Login(loginForm);
      }
  });

  window.Shopify = window.Shopify || {};
  window.Shopify.theme = window.Shopify.theme || {};
  window.Shopify.theme.sections = window.Shopify.theme.sections || {};
  window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
  window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
  const registered = window.Shopify.theme.sections.registered;
  const instances = window.Shopify.theme.sections.instances;
  const selectors$R = {
      id: 'data-section-id',
      type: 'data-section-type'
  };
  let Registration = class Registration {
      getStack() {
          return this.callStack;
      }
      constructor(type = null, components = []){
          this.type = type;
          this.components = validateComponentsArray(components);
          this.callStack = {
              onLoad: [],
              onUnload: [],
              onSelect: [],
              onDeselect: [],
              onBlockSelect: [],
              onBlockDeselect: [],
              onReorder: []
          };
          components.forEach((comp)=>{
              for (const [key, value] of Object.entries(comp)){
                  const arr = this.callStack[key];
                  if (Array.isArray(arr) && typeof value === 'function') {
                      arr.push(value);
                  } else {
                      console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
                      console.warn(value);
                  }
              }
          });
      }
  };
  let Section = class Section {
      callFunctions(key, e = null) {
          this.callStack[key].forEach((func)=>{
              const props = {
                  id: this.id,
                  type: this.type,
                  container: this.container
              };
              if (e) {
                  func.call(props, e);
              } else {
                  func.call(props);
              }
          });
      }
      onLoad() {
          this.callFunctions('onLoad');
      }
      onUnload() {
          this.callFunctions('onUnload');
      }
      onSelect(e) {
          this.callFunctions('onSelect', e);
      }
      onDeselect(e) {
          this.callFunctions('onDeselect', e);
      }
      onBlockSelect(e) {
          this.callFunctions('onBlockSelect', e);
      }
      onBlockDeselect(e) {
          this.callFunctions('onBlockDeselect', e);
      }
      onReorder(e) {
          this.callFunctions('onReorder', e);
      }
      constructor(container, registration){
          this.container = validateContainerElement(container);
          this.id = container.getAttribute(selectors$R.id);
          this.type = registration.type;
          this.callStack = registration.getStack();
          try {
              this.onLoad();
          } catch (e) {
              console.warn(`Error in section: ${this.id}`);
              console.warn(this);
              console.warn(e);
          }
      }
  };
  function validateContainerElement(container) {
      if (!(container instanceof Element)) {
          throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
      }
      if (container.getAttribute(selectors$R.id) === null) {
          throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + selectors$R.id + ' attribute.');
      }
      return container;
  }
  function validateComponentsArray(value) {
      if (typeof value !== 'undefined' && typeof value !== 'object' || value === null) {
          throw new TypeError('Theme Sections: The components object provided is not a valid');
      }
      return value;
  }
  /*
   * @shopify/theme-sections
   * -----------------------------------------------------------------------------
   *
   * A framework to provide structure to your Shopify sections and a load and unload
   * lifecycle. The lifecycle is automatically connected to theme editor events so
   * that your sections load and unload as the editor changes the content and
   * settings of your sections.
   */ function register(type, components) {
      if (typeof type !== 'string') {
          throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
      }
      if (typeof registered[type] !== 'undefined') {
          throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
      }
      if (!Array.isArray(components)) {
          components = [
              components
          ];
      }
      const section = new Registration(type, components);
      registered[type] = section;
      return registered;
  }
  function load(types, containers) {
      types = normalizeType(types);
      if (typeof containers === 'undefined') {
          containers = document.querySelectorAll('[' + selectors$R.type + ']');
      }
      containers = normalizeContainers(containers);
      types.forEach(function(type) {
          const registration = registered[type];
          if (typeof registration === 'undefined') {
              return;
          }
          containers = containers.filter(function(container) {
              // Filter from list of containers because container already has an instance loaded
              if (isInstance(container)) {
                  return false;
              }
              // Filter from list of containers because container doesn't have data-section-type attribute
              if (container.getAttribute(selectors$R.type) === null) {
                  return false;
              }
              // Keep in list of containers because current type doesn't match
              if (container.getAttribute(selectors$R.type) !== type) {
                  return true;
              }
              instances.push(new Section(container, registration));
              // Filter from list of containers because container now has an instance loaded
              return false;
          });
      });
  }
  function unload(selector) {
      var instancesToUnload = getInstances(selector);
      instancesToUnload.forEach(function(instance) {
          var index = instances.map(function(e) {
              return e.id;
          }).indexOf(instance.id);
          instances.splice(index, 1);
          instance.onUnload();
      });
  }
  function reorder(selector) {
      var instancesToReorder = getInstances(selector);
      instancesToReorder.forEach(function(instance) {
          instance.onReorder();
      });
  }
  function getInstances(selector) {
      var filteredInstances = [];
      // Fetch first element if its an array
      if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
          var firstElement = selector[0];
      }
      // If selector element is DOM element
      if (selector instanceof Element || firstElement instanceof Element) {
          var containers = normalizeContainers(selector);
          containers.forEach(function(container) {
              filteredInstances = filteredInstances.concat(instances.filter(function(instance) {
                  return instance.container === container;
              }));
          });
      // If select is type string
      } else if (typeof selector === 'string' || typeof firstElement === 'string') {
          var types = normalizeType(selector);
          types.forEach(function(type) {
              filteredInstances = filteredInstances.concat(instances.filter(function(instance) {
                  return instance.type === type;
              }));
          });
      }
      return filteredInstances;
  }
  function getInstanceById(id) {
      var instance;
      for(var i = 0; i < instances.length; i++){
          if (instances[i].id === id) {
              instance = instances[i];
              break;
          }
      }
      return instance;
  }
  function isInstance(selector) {
      return getInstances(selector).length > 0;
  }
  function normalizeType(types) {
      // If '*' then fetch all registered section types
      if (types === '*') {
          types = Object.keys(registered);
      // If a single section type string is passed, put it in an array
      } else if (typeof types === 'string') {
          types = [
              types
          ];
      // If single section constructor is passed, transform to array with section
      // type string
      } else if (types.constructor === Section) {
          types = [
              types.prototype.type
          ];
      // If array of typed section constructors is passed, transform the array to
      // type strings
      } else if (Array.isArray(types) && types[0].constructor === Section) {
          types = types.map(function(Section1) {
              return Section1.type;
          });
      }
      types = types.map(function(type) {
          return type.toLowerCase();
      });
      return types;
  }
  function normalizeContainers(containers) {
      // Nodelist with entries
      if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
          containers = Array.prototype.slice.call(containers);
      // Empty Nodelist
      } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
          containers = [];
      // Handle null (document.querySelector() returns null with no match)
      } else if (containers === null) {
          containers = [];
      // Single DOM element
      } else if (!Array.isArray(containers) && containers instanceof Element) {
          containers = [
              containers
          ];
      }
      return containers;
  }
  if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function(event) {
          var id = event.detail.sectionId;
          var container = event.target.querySelector('[' + selectors$R.id + '="' + id + '"]');
          if (container !== null) {
              load(container.getAttribute(selectors$R.type), container);
          }
      });
      document.addEventListener('shopify:section:reorder', function(event) {
          var id = event.detail.sectionId;
          var container = event.target.querySelector('[' + selectors$R.id + '="' + id + '"]');
          var instance = getInstances(container)[0];
          if (typeof instance === 'object') {
              reorder(container);
          }
      });
      document.addEventListener('shopify:section:unload', function(event) {
          var id = event.detail.sectionId;
          var container = event.target.querySelector('[' + selectors$R.id + '="' + id + '"]');
          var instance = getInstances(container)[0];
          if (typeof instance === 'object') {
              unload(container);
          }
      });
      document.addEventListener('shopify:section:select', function(event) {
          var instance = getInstanceById(event.detail.sectionId);
          if (typeof instance === 'object') {
              instance.onSelect(event);
          }
      });
      document.addEventListener('shopify:section:deselect', function(event) {
          var instance = getInstanceById(event.detail.sectionId);
          if (typeof instance === 'object') {
              instance.onDeselect(event);
          }
      });
      document.addEventListener('shopify:block:select', function(event) {
          var instance = getInstanceById(event.detail.sectionId);
          if (typeof instance === 'object') {
              instance.onBlockSelect(event);
          }
      });
      document.addEventListener('shopify:block:deselect', function(event) {
          var instance = getInstanceById(event.detail.sectionId);
          if (typeof instance === 'object') {
              instance.onBlockDeselect(event);
          }
      });
  }

  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   */ /**
   * Moves focus to an HTML element
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects. Used in bindInPageLinks()
   * eg move focus to a modal that is opened. Used in trapFocus()
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */ function forceFocus(element, options) {
      options = options || {};
      element.focus();
      if (typeof options.className !== 'undefined') {
          element.classList.add(options.className);
      }
      element.addEventListener('blur', callback);
      function callback(event) {
          event.target.removeEventListener(event.type, callback);
          if (typeof options.className !== 'undefined') {
              element.classList.remove(options.className);
          }
      }
  }
  /**
   * If there's a hash in the url, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - Selector for elements to not include.
   */ function focusHash(options) {
      options = options || {};
      var hash = window.location.hash;
      var element = document.getElementById(hash.slice(1));
      // if we are to ignore this element, early return
      if (element && options.ignore && element.matches(options.ignore)) {
          return false;
      }
      if (hash && element) {
          forceFocus(element, options);
      }
  }
  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - CSS selector for elements to not include.
   */ function bindInPageLinks(options) {
      options = options || {};
      var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
      function queryCheck(selector) {
          return document.getElementById(selector) !== null;
      }
      return links.filter(function(link) {
          if (link.hash === '#' || link.hash === '') {
              return false;
          }
          if (options.ignore && link.matches(options.ignore)) {
              return false;
          }
          if (!queryCheck(link.hash.substr(1))) {
              return false;
          }
          var element = document.querySelector(link.hash);
          if (!element) {
              return false;
          }
          link.addEventListener('click', function() {
              forceFocus(element, options);
          });
          return true;
      });
  }
  function focusable(container) {
      var elements = Array.prototype.slice.call(container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled' + '[data-focus-element]'));
      // Filter out elements that are not visible.
      // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
      return elements.filter(function(element) {
          return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      });
  }
  /**
   * Traps the focus in a particular container
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Element} elementToFocus - Element to be focused on first
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */ var trapFocusHandlers = {};
  function trapFocus(container, options) {
      options = options || {};
      var elements = focusable(container);
      var elementToFocus = options.elementToFocus || container;
      var first = elements[0];
      var last = elements[elements.length - 1];
      removeTrapFocus();
      trapFocusHandlers.focusin = function(event) {
          if (container !== event.target && !container.contains(event.target) && first) {
              first.focus();
          }
          if (event.target !== container && event.target !== last && event.target !== first) return;
          document.addEventListener('keydown', trapFocusHandlers.keydown);
      };
      trapFocusHandlers.focusout = function() {
          document.removeEventListener('keydown', trapFocusHandlers.keydown);
      };
      trapFocusHandlers.keydown = function(event) {
          if (event.keyCode !== 9) return; // If not TAB key
          // On the last focusable element and tab forward, focus the first element.
          if (event.target === last && !event.shiftKey) {
              event.preventDefault();
              first.focus();
          }
          //  On the first focusable element and tab backward, focus the last element.
          if ((event.target === container || event.target === first) && event.shiftKey) {
              event.preventDefault();
              last.focus();
          }
      };
      document.addEventListener('focusout', trapFocusHandlers.focusout);
      document.addEventListener('focusin', trapFocusHandlers.focusin);
      forceFocus(elementToFocus, options);
  }
  /**
   * Removes the trap of focus from the page
   */ function removeTrapFocus() {
      document.removeEventListener('focusin', trapFocusHandlers.focusin);
      document.removeEventListener('focusout', trapFocusHandlers.focusout);
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
  }

  var selectors$Q = {
      drawerWrappper: 'data-drawer',
      drawerScrolls: '[data-drawer-scrolls]',
      underlay: '[data-drawer-underlay]',
      stagger: '[data-stagger-animation]',
      outer: '[data-header-wrapper]',
      drawerToggle: 'data-drawer-toggle',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
  };
  var classes$r = {
      isOpenOuter: 'has-drawer-open',
      isVisible: 'drawer--visible',
      displayNone: 'display-none',
      showMobile: 'js__show__mobile'
  };
  var sections$r = {};
  let Drawer = class Drawer {
      unload() {
      // wipe listeners
      }
      connectToggle() {
          this.buttons.forEach((btn)=>{
              btn.addEventListener('click', (function(e) {
                  e.preventDefault();
                  this.drawer.dispatchEvent(new CustomEvent('theme:drawer:toggle', {
                      bubbles: false
                  }));
              }).bind(this));
          });
      }
      connectDrawer() {
          this.drawer.addEventListener('theme:drawer:toggle', (function() {
              if (this.drawer.classList.contains(classes$r.isVisible)) {
                  this.drawer.dispatchEvent(new CustomEvent('theme:drawer:close', {
                      bubbles: false
                  }));
              } else {
                  this.drawer.dispatchEvent(new CustomEvent('theme:drawer:open', {
                      bubbles: false
                  }));
              }
          }).bind(this));
          this.drawer.addEventListener('theme:drawer:close', this.hideDrawer.bind(this));
          this.drawer.addEventListener('theme:drawer:open', this.showDrawer.bind(this));
      }
      staggerChildAnimations() {
          this.staggers.forEach((el)=>{
              const children = el.querySelectorAll(':scope > * > * > [data-animates]');
              children.forEach((child, index)=>{
                  child.style.transitionDelay = `${index * 50 + 10}ms`;
              });
          });
      }
      closers() {
          this.drawer.addEventListener('keyup', (function(evt) {
              if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
                  return;
              }
              this.hideDrawer();
              this.buttons[0].focus();
          }).bind(this));
          this.underlay.addEventListener('click', (function() {
              this.hideDrawer();
          }).bind(this));
      }
      showDrawer() {
          // animates after display none is removed
          setTimeout(()=>{
              this.drawer.classList.remove(classes$r.displayNone);
              this.buttons.forEach((el)=>el.setAttribute('aria-expanded', true)
              );
              this.drawer.classList.add(classes$r.isVisible);
              if (this.drawerScrolls.length) {
                  this.drawerScrolls.forEach((element)=>{
                      element.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                          bubbles: true
                      }));
                  });
              }
              const firstFocus = this.drawer.querySelector(selectors$Q.focusable);
              trapFocus(this.drawer, {
                  elementToFocus: firstFocus
              });
          }, 1);
          if (this.key === 'hamburger') {
              document.querySelector(`[${selectors$Q.drawerWrappper}="drawer-cart"]`).classList.remove(classes$r.isVisible);
              this.outer.classList.add(classes$r.isOpenOuter);
          }
          if (this.key === 'drawer-cart') {
              document.querySelector(`[${selectors$Q.drawerWrappper}="hamburger"]`).classList.remove(classes$r.isVisible);
              document.querySelector(`[${selectors$Q.drawerWrappper}="hamburger"]`).closest(selectors$Q.outer).classList.remove(classes$r.isOpenOuter);
          }
      }
      hideDrawer() {
          this.buttons.forEach((el)=>el.setAttribute('aria-expanded', true)
          );
          this.drawer.classList.remove(classes$r.isVisible);
          if (this.drawerScrolls.length) {
              this.drawerScrolls.forEach((element)=>{
                  element.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                      bubbles: true
                  }));
              });
          }
          document.dispatchEvent(new CustomEvent('theme:sliderule:close', {
              bubbles: false
          }));
          removeTrapFocus();
          // adds display none after animations
          setTimeout(()=>{
              if (!this.drawer.classList.contains(classes$r.isVisible)) {
                  this.drawer.classList.add(classes$r.displayNone);
              }
          }, 800);
          if (this.key === 'hamburger') {
              this.outer.classList.remove(classes$r.isOpenOuter);
          }
      }
      closeDrawerOnLargeScreens() {
          // Close menu-drawer on resize/orientationchange on larger screens if it happens to be open
          document.addEventListener('theme:resize:width', ()=>{
              if (!this.outer.classList.contains(classes$r.showMobile) && this.outer.classList.contains(classes$r.isOpenOuter)) {
                  this.drawer.dispatchEvent(new CustomEvent('theme:drawer:close', {
                      bubbles: false
                  }));
              }
          });
      }
      constructor(el){
          this.drawer = el;
          this.drawerScrolls = this.drawer.querySelectorAll(selectors$Q.drawerScrolls);
          this.underlay = this.drawer.querySelector(selectors$Q.underlay);
          this.key = this.drawer.dataset.drawer;
          const btnSelector = `[${selectors$Q.drawerToggle}='${this.key}']`;
          this.buttons = document.querySelectorAll(btnSelector);
          this.staggers = this.drawer.querySelectorAll(selectors$Q.stagger);
          this.outer = this.drawer.closest(selectors$Q.outer);
          this.connectToggle();
          this.connectDrawer();
          this.closers();
          this.staggerChildAnimations();
          this.closeDrawerOnLargeScreens();
      }
  };
  const drawer = {
      onLoad () {
          sections$r[this.id] = [];
          const els = this.container.querySelectorAll(`[${selectors$Q.drawerWrappper}]`);
          els.forEach((el)=>{
              sections$r[this.id].push(new Drawer(el));
          });
      },
      onUnload: function() {
          sections$r[this.id].forEach((el)=>{
              if (typeof el.unload === 'function') {
                  el.unload();
              }
          });
      }
  };

  const selectors$P = {
      announcement: '[data-announcement-wrapper]',
      transparent: 'data-header-transparent',
      header: '[data-header-wrapper] header',
      headerIsNotFixed: '[data-header-sticky="static"]'
  };
  const classes$q = {
      stuck: 'js__header__stuck',
      stuckAnimated: 'js__header__stuck--animated',
      triggerAnimation: 'js__header__stuck--trigger-animation',
      stuckBackdrop: 'js__header__stuck__backdrop',
      headerIsNotVisible: 'is-not-visible',
      hasStickyHeader: 'has-sticky-header'
  };
  let sections$q = {};
  let Sticky = class Sticky {
      unload() {
          if (this.sticks || this.animated) {
              document.removeEventListener('theme:scroll', this.scrollEventListen);
          }
          if (this.animated) {
              document.removeEventListener('theme:scroll:up', this.scrollEventUpListen);
              document.removeEventListener('theme:scroll:down', this.scrollEventDownListen);
          }
          if (this.static) {
              document.removeEventListener('theme:scroll', this.scrollEventStatic);
          }
      }
      listen() {
          if (this.sticks || this.animated) {
              document.addEventListener('theme:scroll', this.scrollEventListen);
          }
          if (this.animated) {
              document.addEventListener('theme:scroll:up', this.scrollEventUpListen);
              document.addEventListener('theme:scroll:down', this.scrollEventDownListen);
          }
      }
      listenScroll(e) {
          if (e.detail.down) {
              if (!this.currentlyStuck && e.detail.position > this.stickDown) {
                  this.stickSimple();
              }
              if (!this.currentlyBlurred && e.detail.position > this.blur) {
                  this.addBlur();
              }
          } else {
              if (e.detail.position <= this.stickUp) {
                  this.unstickSimple();
              }
              if (e.detail.position <= this.blur) {
                  this.removeBlur();
              }
          }
      }
      stickSimple() {
          if (this.animated) {
              this.cls.add(classes$q.stuckAnimated);
          }
          this.cls.add(classes$q.stuck);
          this.wrapper.setAttribute(selectors$P.transparent, false);
          this.currentlyStuck = true;
      }
      unstickSimple() {
          if (!document.documentElement.hasAttribute('data-scroll-locked')) {
              // check for scroll lock
              this.cls.remove(classes$q.stuck);
              this.wrapper.setAttribute(selectors$P.transparent, theme.transparentHeader);
              if (this.animated) {
                  this.cls.remove(classes$q.stuckAnimated);
              }
              this.currentlyStuck = false;
          }
      }
      scrollDownInit() {
          if (window.scrollY > this.stickDown) {
              this.stickSimple();
          }
          if (window.scrollY > this.blur) {
              this.addBlur();
          }
      }
      stickDirectional() {
          this.cls.add(classes$q.triggerAnimation);
      }
      unstickDirectional() {
          this.cls.remove(classes$q.triggerAnimation);
      }
      scrollDownDirectional() {
          this.unstickDirectional();
      }
      scrollUpDirectional() {
          if (window.scrollY <= this.stickDown) {
              this.unstickDirectional();
          } else {
              this.stickDirectional();
          }
      }
      addBlur() {
          this.cls.add(classes$q.stuckBackdrop);
          this.currentlyBlurred = true;
      }
      removeBlur() {
          this.cls.remove(classes$q.stuckBackdrop);
          this.currentlyBlurred = false;
      }
      checkIsVisible() {
          const header = document.querySelector(selectors$P.headerIsNotFixed);
          const currentScroll = this.win.pageYOffset;
          if (header) {
              header.classList.toggle(classes$q.headerIsNotVisible, currentScroll >= this.headerHeight);
          }
      }
      constructor(el){
          this.wrapper = el;
          this.type = this.wrapper.dataset.headerSticky;
          this.sticks = this.type === 'sticky';
          this.static = this.type === 'static';
          this.win = window;
          this.animated = this.type === 'directional';
          this.currentlyStuck = false;
          this.cls = this.wrapper.classList;
          const announcementEl = document.querySelector(selectors$P.announcement);
          const announcementHeight = announcementEl ? announcementEl.clientHeight : 0;
          this.headerHeight = document.querySelector(selectors$P.header).clientHeight;
          this.blur = this.headerHeight + announcementHeight;
          this.stickDown = this.headerHeight + announcementHeight;
          this.stickUp = announcementHeight;
          this.scrollEventStatic = ()=>this.checkIsVisible()
          ;
          this.scrollEventListen = (e)=>this.listenScroll(e)
          ;
          this.scrollEventUpListen = ()=>this.scrollUpDirectional()
          ;
          this.scrollEventDownListen = ()=>this.scrollDownDirectional()
          ;
          if (this.wrapper.getAttribute(selectors$P.transparent) !== 'false') {
              this.blur = announcementHeight;
          }
          if (this.sticks) {
              this.stickDown = announcementHeight;
              this.scrollDownInit();
              document.body.classList.add(classes$q.hasStickyHeader);
          } else {
              document.body.classList.remove(classes$q.hasStickyHeader);
          }
          if (this.static) {
              document.addEventListener('theme:scroll', this.scrollEventStatic);
          }
          this.listen();
      }
  };
  const stickyHeader = {
      onLoad () {
          sections$q = new Sticky(this.container);
      },
      onUnload: function() {
          if (typeof sections$q.unload === 'function') {
              sections$q.unload();
          }
      }
  };

  const selectors$O = {
      disclosureToggle: 'data-hover-disclosure-toggle',
      disclosureWrappper: '[data-hover-disclosure]',
      link: '[data-top-link]',
      wrapper: '[data-header-wrapper]',
      stagger: '[data-stagger]',
      staggerPair: '[data-stagger-first]',
      staggerAfter: '[data-stagger-second]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  };
  const classes$p = {
      isVisible: 'is-visible',
      meganavVisible: 'meganav--visible',
      meganavIsTransitioning: 'meganav--is-transitioning'
  };
  let sections$p = {};
  let disclosures = {};
  let HoverDisclosure = class HoverDisclosure {
      onBlockSelect(evt) {
          if (this.disclosure.contains(evt.target)) {
              this.showDisclosure(evt);
          }
      }
      onBlockDeselect(evt) {
          if (this.disclosure.contains(evt.target)) {
              this.hideDisclosure();
          }
      }
      showDisclosure(e) {
          if (e && e.type && e.type === 'mouseenter') {
              this.wrapper.classList.add(classes$p.meganavIsTransitioning);
          }
          if (this.grandparent) {
              this.wrapper.classList.add(classes$p.meganavVisible);
          } else {
              this.wrapper.classList.remove(classes$p.meganavVisible);
          }
          this.trigger.setAttribute('aria-expanded', true);
          this.trigger.classList.add(classes$p.isVisible);
          this.disclosure.classList.add(classes$p.isVisible);
          if (this.transitionTimeout) {
              clearTimeout(this.transitionTimeout);
          }
          this.transitionTimeout = setTimeout(()=>{
              this.wrapper.classList.remove(classes$p.meganavIsTransitioning);
          }, 200);
      }
      hideDisclosure() {
          this.disclosure.classList.remove(classes$p.isVisible);
          this.trigger.classList.remove(classes$p.isVisible);
          this.trigger.setAttribute('aria-expanded', false);
          this.wrapper.classList.remove(classes$p.meganavVisible, classes$p.meganavIsTransitioning);
      }
      staggerChildAnimations() {
          const simple = this.disclosure.querySelectorAll(selectors$O.stagger);
          simple.forEach((el, index)=>{
              el.style.transitionDelay = `${index * 50 + 10}ms`;
          });
          const pairs = this.disclosure.querySelectorAll(selectors$O.staggerPair);
          pairs.forEach((child, i)=>{
              const d1 = i * 150;
              child.style.transitionDelay = `${d1}ms`;
              child.parentElement.querySelectorAll(selectors$O.staggerAfter).forEach((grandchild, i2)=>{
                  const di1 = i2 + 1;
                  const d2 = di1 * 20;
                  grandchild.style.transitionDelay = `${d1 + d2}ms`;
              });
          });
      }
      handleTablets() {
          // first click opens the popup, second click opens the link
          this.trigger.addEventListener('touchstart', (function(e) {
              const isOpen = this.disclosure.classList.contains(classes$p.isVisible);
              if (!isOpen) {
                  e.preventDefault();
                  this.showDisclosure(e);
              }
          }).bind(this), {
              passive: true
          });
      }
      connectHoverToggle() {
          this.trigger.addEventListener('mouseenter', (e)=>this.showDisclosure(e)
          );
          this.link.addEventListener('focus', (e)=>this.showDisclosure(e)
          );
          this.trigger.addEventListener('mouseleave', ()=>this.hideDisclosure()
          );
          this.trigger.addEventListener('focusout', (e)=>{
              const inMenu = this.trigger.contains(e.relatedTarget);
              if (!inMenu) {
                  this.hideDisclosure();
              }
          });
          this.disclosure.addEventListener('keyup', (evt)=>{
              if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
                  return;
              }
              this.hideDisclosure();
          });
      }
      constructor(el){
          this.disclosure = el;
          this.wrapper = el.closest(selectors$O.wrapper);
          this.key = this.disclosure.id;
          this.trigger = document.querySelector(`[${selectors$O.disclosureToggle}='${this.key}']`);
          this.link = this.trigger.querySelector(selectors$O.link);
          this.grandparent = this.trigger.classList.contains('grandparent');
          this.transitionTimeout = 0;
          this.trigger.setAttribute('aria-haspopup', true);
          this.trigger.setAttribute('aria-expanded', false);
          this.trigger.setAttribute('aria-controls', this.key);
          this.connectHoverToggle();
          this.handleTablets();
          this.staggerChildAnimations();
      }
  };
  const hoverDisclosure = {
      onLoad () {
          sections$p[this.id] = [];
          disclosures = this.container.querySelectorAll(selectors$O.disclosureWrappper);
          disclosures.forEach((el)=>{
              sections$p[this.id].push(new HoverDisclosure(el));
          });
      },
      onBlockSelect (evt) {
          sections$p[this.id].forEach((el)=>{
              if (typeof el.onBlockSelect === 'function') {
                  el.onBlockSelect(evt);
              }
          });
      },
      onBlockDeselect (evt) {
          sections$p[this.id].forEach((el)=>{
              if (typeof el.onBlockDeselect === 'function') {
                  el.onBlockDeselect(evt);
              }
          });
      }
  };

  const selectors$N = {
      count: 'data-cart-count'
  };
  let Totals = class Totals {
      listen() {
          document.addEventListener('theme:cart:change', (function(event) {
              this.cart = event.detail.cart;
              this.update();
          }).bind(this));
      }
      update() {
          if (this.cart) {
              this.counts.forEach((count)=>{
                  count.setAttribute(selectors$N.count, this.cart.item_count);
                  count.innerHTML = `${this.cart.item_count}`;
              });
          }
      }
      constructor(el){
          this.section = el;
          this.counts = this.section.querySelectorAll(`[${selectors$N.count}]`);
          this.cart = null;
          this.listen();
      }
  };
  const headerTotals = {
      onLoad () {
          new Totals(this.container);
      }
  };

  function FetchError(object) {
      this.status = object.status || null;
      this.headers = object.headers || null;
      this.json = object.json || null;
      this.body = object.body || null;
  }
  FetchError.prototype = Error.prototype;

  const slideDown = (target, duration = 500, checkHidden = true)=>{
      let display = window.getComputedStyle(target).display;
      if (checkHidden && display !== 'none') {
          return;
      }
      target.style.removeProperty('display');
      if (display === 'none') display = 'block';
      target.style.display = display;
      let height = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      target.offsetHeight;
      target.style.boxSizing = 'border-box';
      target.style.transitionTimingFunction = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = height + 'px';
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      window.setTimeout(()=>{
          target.style.removeProperty('height');
          target.style.removeProperty('overflow');
          target.style.removeProperty('transition-duration');
          target.style.removeProperty('transition-property');
          target.style.removeProperty('transition-timing-function');
      }, duration);
  };

  const slideUp = (target, duration = 500)=>{
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionTimingFunction = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
      target.style.transitionDuration = duration + 'ms';
      target.style.boxSizing = 'border-box';
      target.style.height = target.offsetHeight + 'px';
      target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = 0;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      window.setTimeout(()=>{
          target.style.display = 'none';
          target.style.removeProperty('height');
          target.style.removeProperty('padding-top');
          target.style.removeProperty('padding-bottom');
          target.style.removeProperty('margin-top');
          target.style.removeProperty('margin-bottom');
          target.style.removeProperty('overflow');
          target.style.removeProperty('transition-duration');
          target.style.removeProperty('transition-property');
          target.style.removeProperty('transition-timing-function');
      }, duration);
  };

  class CartNotes {
      initInputs() {
          this.inputs.forEach((input)=>{
              input.addEventListener('change', (function(e) {
                  const note = e.target.value.toString() || '';
                  this.saveNotes(note);
              }).bind(this));
          });
      }
      saveNotes(newNote) {
          window.fetch(`${window.theme.routes.cart}/update.js`, {
              method: 'post',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  note: newNote
              })
          }).catch((e)=>{
              console.error(e);
          });
      }
      constructor(element){
          this.inputs = element.querySelectorAll('[data-cart-note]');
          this.initInputs();
      }
  }

  const getUrlString = (params, keys = [], isArray = false)=>{
      const p = Object.keys(params).map((key)=>{
          let val = params[key];
          if (Object.prototype.toString.call(val) === '[object Object]' || Array.isArray(val)) {
              if (Array.isArray(params)) {
                  keys.push('');
              } else {
                  keys.push(key);
              }
              return getUrlString(val, keys, Array.isArray(val));
          } else {
              let tKey = key;
              if (keys.length > 0) {
                  const tKeys = isArray ? keys : [
                      ...keys,
                      key
                  ];
                  tKey = tKeys.reduce((str, k)=>{
                      return str === '' ? k : `${str}[${k}]`;
                  }, '');
              }
              if (isArray) {
                  return `${tKey}[]=${val}`;
              } else {
                  return `${tKey}=${val}`;
              }
          }
      }).join('&');
      keys.pop();
      return p;
  };

  const selectors$M = {
      submitButton: '[data-submit-shipping]',
      form: '[data-shipping-estimate-form]',
      template: '[data-response-template]',
      country: '#estimate_address_country',
      province: '#estimate_address_province',
      zip: '#estimate_address_zip',
      wrapper: '[data-response-wrapper]',
      defaultData: 'data-default-fullname'
  };
  const classes$o = {
      success: 'shipping--success',
      error: 'errors'
  };
  class ShippingCalculator {
      enableButtons() {
          this.button.removeAttribute('disabled');
          this.button.classList.remove('disabled');
      }
      disableButtons() {
          this.button.setAttribute('disabled', 'disabled');
          this.button.classList.add('disabled');
      }
      render(rates) {
          if (this.template && this.ratesWrapper) {
              const rendered = Sqrl__namespace.render(this.template, rates);
              this.ratesWrapper.innerHTML = rendered;
          }
          this.enableButtons();
          this.ratesWrapper.style.removeProperty('display');
      }
      estimate(shipping_address) {
          const encodedShippingAddressData = encodeURI(getUrlString({
              shipping_address: shipping_address
          }));
          const url = `${window.theme.routes.cart}/shipping_rates.json?${encodedShippingAddressData}`;
          const instance = this;
          axios.get(url).then(function(response) {
              // handle success
              const items = instance.sanitize(response);
              instance.render(items);
              instance.enableButtons();
              instance.ratesWrapper.style.removeProperty('display');
          }).catch(function(error) {
              // handle errors
              const errors = instance.sanitizeErrors(error);
              instance.render(errors);
          });
      }
      sanitize(response) {
          const sanitized = {};
          sanitized.class = classes$o.success;
          sanitized.items = [];
          if (response.data.shipping_rates && response.data.shipping_rates.length > 0) {
              const rates = response.data.shipping_rates;
              rates.forEach((r)=>{
                  let item = {};
                  item.title = r.presentment_name;
                  item.value = themeCurrency.formatMoney(r.price, theme.moneyFormat);
                  sanitized.items.push(item);
              });
          } else {
              sanitized.items[0] = {
                  value: theme.strings.noShippingAvailable
              };
          }
          return sanitized;
      }
      sanitizeErrors(response) {
          const errors = {};
          errors.class = classes$o.error;
          errors.items = [];
          if (typeof response.data === 'object') {
              for (const [key, value] of Object.entries(response.data)){
                  let item = {};
                  item.title = key.toString();
                  item.value = value.toString();
                  errors.items.push(item);
              }
          } else {
              errors.items[0] = {
                  value: theme.strings.noShippingAvailable
              };
          }
          return errors;
      }
      init() {
          const htmlEl = document.querySelector('html');
          let locale = 'en';
          if (htmlEl.hasAttribute('lang') && htmlEl.getAttribute('lang') !== '') {
              locale = htmlEl.getAttribute('lang');
          }
          if (this.form) {
              themeAddresses.AddressForm(this.form, locale, {
                  shippingCountriesOnly: true
              });
          }
          if (this.country && this.country.hasAttribute('data-default') && this.province && this.province.hasAttribute('data-default')) {
              this.country.addEventListener('change', function() {
                  this.country.removeAttribute('data-default');
                  this.province.removeAttribute('data-default');
              });
          }
          if (this.button) {
              this.button.addEventListener('click', (function(e) {
                  e.preventDefault();
                  this.disableButtons();
                  while(this.ratesWrapper.firstChild)this.ratesWrapper.removeChild(this.ratesWrapper.firstChild);
                  this.ratesWrapper.style.display = 'none';
                  const shippingAddress = {};
                  let elemCountryVal = this.country.value;
                  let elemProvinceVal = this.province.value;
                  const elemCountryData = this.country.getAttribute(selectors$M.defaultData);
                  if (elemCountryVal === '' && elemCountryData && elemCountryData !== '') {
                      elemCountryVal = elemCountryData;
                  }
                  const elemProvinceData = this.province.getAttribute(selectors$M.defaultData);
                  if (elemProvinceVal === '' && elemProvinceData && elemProvinceData !== '') {
                      elemProvinceVal = elemProvinceData;
                  }
                  shippingAddress.zip = this.zip.value || '';
                  shippingAddress.country = elemCountryVal || '';
                  shippingAddress.province = elemProvinceVal || '';
                  this.estimate(shippingAddress);
              }).bind(this));
          }
      }
      constructor(section){
          this.button = section.container.querySelector(selectors$M.submitButton);
          this.template = section.container.querySelector(selectors$M.template).innerHTML;
          this.ratesWrapper = section.container.querySelector(selectors$M.wrapper);
          this.form = section.container.querySelector(selectors$M.form);
          this.country = section.container.querySelector(selectors$M.country);
          this.province = section.container.querySelector(selectors$M.province);
          this.zip = section.container.querySelector(selectors$M.zip);
          this.init();
      }
  }

  const selectors$L = {
      cartMessage: '[data-cart-message]',
      cartMessageValue: 'data-cart-message',
      leftToSpend: '[data-left-to-spend]',
      cartProgress: '[data-cart-progress]'
  };
  const classes$n = {
      isHidden: 'is-hidden',
      isSuccess: 'is-success'
  };
  let CartShippingMessage = class CartShippingMessage {
      init() {
          this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute('data-limit')) * 100;
          this.cartFreeLimitShipping *= window.Shopify.currency.rate;
          this.shippingAmount = 0;
          this.cartBarProgress();
          this.listen();
      }
      listen() {
          document.addEventListener('theme:cart:change', (function(event) {
              this.cart = event.detail.cart;
              this.render();
          }).bind(this));
      }
      render() {
          if (this.cart && this.cart.total_price) {
              const totalPrice = this.cart.total_price;
              this.freeShippingMessageHandle(totalPrice);
              // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
              if (this.cartMessage.length > 0) {
                  this.shippingAmount = totalPrice;
                  this.updateProgress();
              }
          }
      }
      freeShippingMessageHandle(total) {
          if (this.cartMessage.length > 0) {
              this.container.querySelectorAll(selectors$L.cartMessage).forEach((message)=>{
                  const hasFreeShipping = message.hasAttribute(selectors$L.cartMessageValue) && message.getAttribute(selectors$L.cartMessageValue) === 'true' && total !== 0;
                  const cartMessageClass = hasFreeShipping ? classes$n.isSuccess : classes$n.isHidden;
                  message.classList.toggle(cartMessageClass, total >= this.cartFreeLimitShipping);
              });
          }
      }
      cartBarProgress(progress = null) {
          this.container.querySelectorAll(selectors$L.cartProgress).forEach((element)=>{
              this.setProgress(element, progress === null ? element.getAttribute('data-percent') : progress);
          });
      }
      setProgress(holder, percent) {
          holder.style.setProperty('--bar-progress', `${percent}%`);
      }
      updateProgress() {
          const newPercentValue = this.shippingAmount / this.cartFreeLimitShipping * 100;
          const leftToSpend = theme.settings.currency_code_enable ? themeCurrency.formatMoney(this.cartFreeLimitShipping - this.shippingAmount, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(this.cartFreeLimitShipping - this.shippingAmount, theme.moneyFormat);
          this.container.querySelectorAll(selectors$L.leftToSpend).forEach((element)=>{
              element.innerHTML = leftToSpend.replace('.00', '');
          });
          this.cartBarProgress(newPercentValue > 100 ? 100 : newPercentValue);
      }
      constructor(section){
          this.container = section;
          this.cartMessage = this.container.querySelectorAll(selectors$L.cartMessage);
          if (this.cartMessage.length > 0) {
              this.init();
          }
      }
  };

  let sections$o = {};
  const selectors$K = {
      wrapper: '[data-add-action-wrapper]',
      addButton: '[data-add-to-cart]',
      errors: '[data-add-action-errors]',
      addVariantDetached: 'data-add-to-cart-variant',
      drawer: '[data-drawer="drawer-cart"]',
      cartPage: '[data-ajax-disable]',
      popoutWrapper: '[data-upsell-modal]',
      checkoutButton: '[data-checkout-button]'
  };
  const classes$m = {
      loading: 'loading',
      success: 'has-success',
      open: 'is-open'
  };
  let ProductAddButton = class ProductAddButton {
      initWithForm() {
          this.button.addEventListener('click', (function(evt) {
              const outerForm = evt.target.closest('form');
              if (outerForm.querySelector('[type="file"]')) {
                  return;
              }
              if (!this.reloadCart) {
                  evt.preventDefault();
              }
              this.button.setAttribute('disabled', true);
              this.button.classList.add(classes$m.loading);
              const formData = new FormData(outerForm);
              const formString = new URLSearchParams(formData).toString();
              this.addToCartAction(formString);
          }).bind(this));
      }
      initDetached() {
          this.button.addEventListener('click', (function(evt) {
              evt.preventDefault();
              this.button.setAttribute('disabled', true);
              this.button.classList.add(classes$m.loading);
              const variant = this.button.getAttribute(selectors$K.addVariantDetached);
              const formString = `form_type=product&id=${variant}`;
              this.addToCartAction(formString);
          }).bind(this));
      }
      addToCartAction(formData) {
          const url = `${window.theme.routes.cart}/add.js`;
          const instance = this;
          axios.post(url, formData, {
              headers: {
                  'X-Requested-With': 'XMLHttpRequest',
                  'Content-Type': 'application/x-www-form-urlencoded'
              }
          }).then(function(response) {
              instance.onSuccess(response.data);
          }).catch(function(error) {
              console.warn(error);
              instance.onError(error.data);
          });
      }
      onSuccess(variant) {
          this.updateHeaderTotal();
          this.button.classList.remove(classes$m.loading);
          this.button.classList.add(classes$m.success);
          setTimeout(()=>{
              this.button.classList.remove(classes$m.success);
              this.button.removeAttribute('disabled');
          }, 3500);
          if (this.reloadCart) {
              document.dispatchEvent(new CustomEvent('theme:cart:reload', {
                  bubbles: true
              }));
          } else if (this.drawer) {
              this.drawer.dispatchEvent(new CustomEvent('theme:drawer:open', {
                  detail: {
                      variant: variant,
                      reinit: true
                  },
                  bubbles: true
              }));
          }
          const upsellModal = document.querySelector(selectors$K.popoutWrapper);
          if (upsellModal) {
              upsellModal.classList.remove(classes$m.open);
              upsellModal.setAttribute('aria-hidden', true);
          }
      }
      onError(data) {
          let text = 'Network error: please try again';
          if (data && data.description) {
              text = data.description;
          }
          const errorsHTML = `<div class="errors">${text}</div>`;
          this.button.classList.remove(classes$m.loading);
          this.button.removeAttribute('disabled');
          this.errors.innerHTML = errorsHTML;
          slideDown(this.errors);
          setTimeout(()=>{
              slideUp(this.errors);
          }, 5000);
      }
      updateHeaderTotal() {
          axios.get(`${window.theme.routes.cart}.js`).then((response)=>{
              document.dispatchEvent(new CustomEvent('theme:cart:change', {
                  detail: {
                      cart: response.data
                  },
                  bubbles: true
              }));
          }).catch((e)=>{
              console.error(e);
          });
      }
      constructor(wrapper, reloadCart = false){
          this.wrapper = wrapper;
          this.button = wrapper.querySelector(selectors$K.addButton);
          this.errors = wrapper.querySelector(selectors$K.errors);
          this.drawer = document.querySelector(selectors$K.drawer);
          this.reloadCart = reloadCart;
          if (document.querySelector(selectors$K.cartPage)) {
              this.reloadCart = true;
          }
          if (this.button) {
              const isDetached = this.button.hasAttribute(selectors$K.addVariantDetached);
              if (isDetached) {
                  this.initDetached();
              } else {
                  this.initWithForm();
              }
          }
      }
  };
  const productAddSection = {
      onLoad () {
          sections$o[this.id] = [];
          const els = this.container.querySelectorAll(selectors$K.wrapper);
          els.forEach((el)=>{
              sections$o[this.id].push(new ProductAddButton(el));
          });
      },
      onUnload: function() {
          sections$o[this.id].forEach((el)=>{
              if (typeof el.unload === 'function') {
                  el.unload();
              }
          });
      }
  };

  const selectors$J = {
      upsellHolder: 'data-upsell-holder',
      addButtonWrapper: '[data-add-action-wrapper]',
      upsellModal: '[data-upsell-modal]',
      modalContent: '[data-product-upsell-ajax]',
      upsellModalTemplate: '[data-upsell-modal-template]',
      cartLineItems: '[data-line-items]',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
  };
  let UpsellProduct = class UpsellProduct extends HTMLElement {
      init() {
          if (this.modalTemplate && this.triggerButton) {
              this.triggerButton.addEventListener('click', (e)=>{
                  e.preventDefault();
                  if (this.modal && this.modalID) {
                      this.modal.id = this.modalID;
                  }
                  this.getUpsellHTML();
              });
          }
          // Has only default variant
          if (this.isCartItem) {
              new ProductAddButton(this.upsellHolder, this.isCartItem);
          }
      }
      getUpsellHTML() {
          window.fetch(`${window.theme.routes.root_url}products/${this.handle}?section_id=api-product-upsell`).then(this.handleErrors).then((response)=>{
              return response.text();
          }).then((response)=>{
              const fresh = document.createElement('div');
              fresh.innerHTML = response;
              this.modalContent = document.querySelector(selectors$J.modalContent);
              this.modalContent.innerHTML = fresh.querySelector('[data-api-content]').innerHTML;
              this.modalCreate();
          });
      }
      modalCreate() {
          MicroModal.show(this.modalID, {
              onShow: (modal, el, event)=>{
                  const addButtonWrapper = modal.querySelector(selectors$J.addButtonWrapper);
                  new ProductAddButton(addButtonWrapper, this.isCartItem);
                  const firstFocus = modal.querySelector(selectors$J.focusable);
                  trapFocus(modal, {
                      elementToFocus: firstFocus
                  });
              },
              onClose: (modal, el, event)=>{
                  removeTrapFocus();
                  el.focus();
              }
          });
      }
      handleErrors(response) {
          if (!response.ok) {
              return response.json().then(function(json) {
                  const e = new FetchError({
                      status: response.statusText,
                      headers: response.headers,
                      json: json
                  });
                  throw e;
              });
          }
          return response;
      }
      constructor(){
          super();
          this.upsellHolder = this.querySelector(`[${selectors$J.upsellHolder}]`);
          if (this.upsellHolder) {
              this.isCartItem = Boolean(this.upsellHolder.closest(selectors$J.cartLineItems));
              this.modalTemplate = this.upsellHolder.querySelector(selectors$J.upsellModalTemplate);
              this.modal = document.querySelector(selectors$J.upsellModal);
              this.modalID = this.upsellHolder.getAttribute(selectors$J.upsellHolder);
              this.triggerButton = this.upsellHolder.querySelector(`[data-popup-${this.modalID}]`);
              this.handle = this.triggerButton ? this.triggerButton.getAttribute(`data-popup-${this.modalID}`) : null;
              this.modalContent = null;
              if (this.modalTemplate && !this.modal) {
                  const modalTemplateInner = this.modalTemplate.innerHTML;
                  const htmlObject = document.createElement('div');
                  htmlObject.innerHTML = modalTemplateInner;
                  const modalHtml = htmlObject.querySelector(selectors$J.upsellModal);
                  document.body.appendChild(modalHtml);
                  this.modal = document.querySelector(selectors$J.upsellModal);
              }
              this.init();
          }
      }
  };

  const selectors$I = {
      wrapper: '[data-quantity-selector]',
      increase: '[data-increase-quantity]',
      decrease: '[data-decrease-quantity]',
      input: '[data-quantity-input]'
  };
  let Quantity = class Quantity {
      initButtons() {
          this.increase.addEventListener('click', (function(e) {
              e.preventDefault();
              let v = parseInt(this.input.value, 10);
              v = isNaN(v) ? 0 : v;
              v++;
              this.input.value = v;
              this.input.dispatchEvent(new Event('change'));
          }).bind(this));
          this.decrease.addEventListener('click', (function(e) {
              e.preventDefault();
              let v = parseInt(this.input.value, 10);
              v = isNaN(v) ? 0 : v;
              v--;
              v = Math.max(this.min, v);
              this.input.value = v;
              this.input.dispatchEvent(new Event('change'));
          }).bind(this));
      }
      constructor(wrapper){
          this.wrapper = wrapper;
          this.increase = this.wrapper.querySelector(selectors$I.increase);
          this.decrease = this.wrapper.querySelector(selectors$I.decrease);
          this.input = this.wrapper.querySelector(selectors$I.input);
          this.min = parseInt(this.input.getAttribute('min'), 10);
          this.initButtons();
      }
  };
  function initQtySection(container) {
      const quantityWrappers = container.querySelectorAll(selectors$I.wrapper);
      quantityWrappers.forEach((qty)=>{
          new Quantity(qty);
      });
  }

  const selectors$H = {
      drawer: '[data-drawer="drawer-cart"]',
      shipping: '[data-shipping-estimate-form]',
      loader: '[data-cart-loading]',
      form: '[data-cart-form]',
      emptystate: '[data-cart-empty]',
      progress: '[data-cart-progress]',
      items: '[data-line-items]',
      subtotal: '[data-cart-subtotal]',
      bottom: '[data-cart-bottom]',
      quantity: '[data-quantity-selector]',
      errors: '[data-form-errors]',
      item: '[data-cart-item]',
      finalPrice: '[data-cart-final]',
      key: 'data-update-cart',
      remove: 'data-remove-key',
      upsellProduct: '[data-upsell-holder]',
      cartPage: '[data-section-type="cart"]',
      bar: '[data-cart-bar]',
      blankState: '[data-cart-blankstate]'
  };
  const classes$l = {
      hidden: 'cart--hidden',
      loading: 'cart--loading'
  };
  let CartItems = class CartItems {
      listen() {
          document.addEventListener('theme:cart:change', (function(event) {
              this.cart = event.detail.cart;
              this.stale = true;
          }).bind(this));
          document.addEventListener('theme:cart:init', (function() {
              this.init();
          }).bind(this));
          document.addEventListener('theme:cart:reload', (function() {
              this.stale = true;
              if (this.cart) {
                  this.loadHTML();
              } else {
                  this.init().then(()=>this.loadHTML()
                  );
                 
              }
          }).bind(this));
          if (this.drawer) {
              this.drawer.addEventListener('theme:drawer:open', (function(event) {
                  const reinit = event.detail === null ? false : event.detail.reinit;
                  if (this.cart && !reinit) {
                      this.loadHTML();
                  } else {
                      this.init().then(()=>this.loadHTML()
                      );
                  }
              }).bind(this));
          }
          new CartNotes(this.container);
          new CartShippingMessage(this.container);
      }
      init() {
          if (!this.emptystate.classList.contains(classes$l.hidden)) {
              var ref;
              this.emptystate.classList.add(classes$l.hidden);
              (ref = this.blankState) === null || ref === void 0 ? void 0 : ref.classList.remove(classes$l.hidden);
          }
          return window.fetch(`${window.theme.routes.cart}.js`).then(this.handleErrors).then((response)=>{
              return response.json();
          }).then((response)=>{
              this.cart = response;
              this.fireChange(response);
              return response;
          }).catch((e)=>{
              console.error(e);
          });
      }
      loadHTML() {
          if (this.stale) {
              if (this.cart && this.cart.item_count > 0) {
                  this.loadForm();
              } else {
                  this.showEmpty();
              }
          }
          this.stale = false;
      }
      initInputs() {
          this.inputs = this.container.querySelectorAll(`[${selectors$H.key}]`);
          this.inputs.forEach((input)=>{
              const key = input.getAttribute(selectors$H.key);
              input.addEventListener('change', (function(e) {
                  const quantity = parseInt(e.target.value, 10);
                  this.latestClick = e.target.closest(selectors$H.item);
                  this.lockState();
                  this.updateCart(key, quantity);
              }).bind(this));
          });
      }
      initRemove() {
          this.removers = this.container.querySelectorAll(`[${selectors$H.remove}]`);
          this.removers.forEach((remover)=>{
              const key = remover.getAttribute(selectors$H.remove);
              remover.addEventListener('click', (function(e) {
                  e.preventDefault();
                  this.latestClick = e.target.closest(selectors$H.item);
                  this.lockState();
                  this.updateCart(key, 0);
              }).bind(this));
          });
      }
      lockState() {
          this.latestClick.querySelector('.item--loadbar').style.display = 'block';
          this.loader.classList.add(classes$l.loading);
      }
      updateCart(clickedKey, newQuantity) {
          let oldCount = null;
          let newCount = null;
          let newItem = null;
          window.fetch(`${window.theme.routes.cart}.js`).then(this.handleErrors).then((response)=>{
              return response.json();
          }).then((response)=>{
              const matchKeys = (item)=>item.key === clickedKey
              const index = response.items.findIndex(matchKeys);
              oldCount = response.item_count;
              newItem = response.items[index].title;
              const data = {
                  line: `${index + 1}`,
                  quantity: newQuantity
              };
              return window.fetch(`${window.theme.routes.cart}/change.js`, {
                  method: 'post',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
              });
          }).then(this.handleErrors).then((response)=>{
              return response.json();
          }).then((response)=>{
              this.cart = response;
              newCount = response.item_count;
              if (oldCount === newCount) {
                  this.stockoutError(newItem);
                  this.stale = true;
              } else {
                  slideUp(this.errors);
                  this.fireChange(response);
                  this.stale = true;
              }
              this.loadHTML();
          }).catch((e)=>{
              console.error(e);
              let heading = '';
              if (typeof e.status !== 'undefined') {
                  heading = `<p>${e.status}</p>`;
              }
              let paragraph = e.json.description || '';
              this.showError(`${heading + paragraph}`);
              this.loadHTML();
          });
      }
      fireChange(newCart) {
          document.dispatchEvent(new CustomEvent('theme:cart:change', {
              detail: {
                  cart: newCart
              },
              bubbles: true
          }));
      }
      updateTotal() {
          if (this.cart && this.cart.total_price) {
              const price = themeCurrency.formatMoney(this.cart.total_price, theme.moneyFormat);
              this.finalPrice.innerHTML = price + ` ${theme.currencyCode}`;
          }
          if (this.subtotal && this.cart) {
              window.fetch(`${window.theme.routes.root_url}?section_id=api-cart-subtotal`).then(this.handleErrors).then((response)=>{
                  return response.text();
              }).then((response)=>{
                  const fresh = document.createElement('div');
                  fresh.innerHTML = response;
                  this.subtotal.innerHTML = fresh.querySelector('[data-api-content]').innerHTML;
              });
          }
      }
      showError(message) {
          slideUp(this.errors);
          this.errors.innerHTML = message;
          window.setTimeout(()=>{
              slideDown(this.errors);
          }, 600);
      }
      stockoutError(itemTitle) {
          let heading = `<p><strong>${window.theme.strings.stockout}</strong></p>`;
          let paragraph = `<p>${itemTitle}</p>`;
          this.showError(`${heading + paragraph}`);
      }
      loadForm() {
          window.fetch(`${window.theme.routes.root_url}?section_id=api-cart-items`).then(this.handleErrors).then((response)=>{
              return response.text();
          }).then((response)=>{
              const fresh = document.createElement('div');
              fresh.innerHTML = response;
              this.items.innerHTML = fresh.querySelector('[data-api-content]').innerHTML;
              this.showForm();
              this.initQuantity();
              this.initUpsell();
              this.updateTotal();
              if (this.drawer) {
                  moveModals(this.drawer);
              }
          });
      }
      initUpsell() {
          const upsellProduct = this.items.querySelector(selectors$H.upsellProduct);
          const oldUpsellProduct = this.bottom.querySelector(selectors$H.upsellProduct);
          const upsellButton = this.items.querySelector('[data-add-action-wrapper]');
          if (oldUpsellProduct) {
              oldUpsellProduct.remove();
          }
          if (this.cartPage && upsellProduct) {
              this.bottom.insertBefore(upsellProduct, this.bottom.firstChild);
          }
          if (upsellProduct && upsellButton) {
              // isCartItem tells add button to refresh the cart
              // instead of loading a popdown notification
              const isCartItem = true;
              new UpsellProduct(this.section, isCartItem);
          }
      }
      initQuantity() {
          initQtySection(this.container);
          this.initInputs();
          this.initRemove();
      }
      showForm() {
          var ref;
          if (this.bar) {
              this.bar.classList.remove(classes$l.hidden);
          }
          this.form.classList.remove(classes$l.hidden);
          this.bottom.classList.remove(classes$l.hidden);
          (ref = this.progress) === null || ref === void 0 ? void 0 : ref.classList.remove(classes$l.hidden);
          this.loader.classList.remove(classes$l.loading);
          this.emptystate.classList.add(classes$l.hidden);
          if (this.blankState) {
              this.blankState.classList.add(classes$l.hidden);
          }
      }
      showEmpty() {
          var ref;
          if (this.bar) {
              this.bar.classList.add(classes$l.hidden);
          }
          this.emptystate.classList.remove(classes$l.hidden);
          this.loader.classList.remove(classes$l.loading);
          this.form.classList.add(classes$l.hidden);
          this.bottom.classList.add(classes$l.hidden);
          (ref = this.progress) === null || ref === void 0 ? void 0 : ref.classList.add(classes$l.hidden);
          if (this.blankState) {
              this.blankState.classList.add(classes$l.hidden);
          }
      }
      handleErrors(response) {
          if (!response.ok) {
              return response.json().then(function(json) {
                  const e = new FetchError({
                      status: response.statusText,
                      headers: response.headers,
                      json: json
                  });
                  throw e;
              });
          }
          return response;
      }
      constructor(section){
          this.section = section;
          this.container = section.container;
          this.bar = this.container.querySelector(selectors$H.bar);
          this.drawer = this.container.querySelector(selectors$H.drawer);
          this.form = this.container.querySelector(selectors$H.form);
          this.loader = this.container.querySelector(selectors$H.loader);
          this.bottom = this.container.querySelector(selectors$H.bottom);
          this.items = this.container.querySelector(selectors$H.items);
          this.subtotal = this.container.querySelector(selectors$H.subtotal);
          this.errors = this.container.querySelector(selectors$H.errors);
          this.finalPrice = this.container.querySelector(selectors$H.finalPrice);
          this.emptystate = this.container.querySelector(selectors$H.emptystate);
          this.progress = this.container.querySelector(selectors$H.progress);
          this.blankState = this.container.querySelector(selectors$H.blankState);
          this.latestClick = null;
          this.cart = null;
          this.stale = true;
          this.cartPage = document.querySelector(selectors$H.cartPage);
          this.listen();
      }
  };
  const cartDrawer = {
      onLoad () {
          const isDrawerCart = this.container.querySelector(selectors$H.drawer);
          if (isDrawerCart) {
              this.cart = new CartItems(this);
          }
          const hasShipping = this.container.querySelector(selectors$H.shipping);
          if (hasShipping) {
              new ShippingCalculator(this);
          }
      },
      onUnload: function() {
          if (this.cart && typeof this.cart.unload === 'function') {
              this.cart.unload();
          }
      }
  };

  const selectors$G = {
      wrapper: '[data-search-popdown-wrap]',
      popdownTrigger: 'data-popdown-toggle',
      close: '[data-close-popdown]',
      input: '[data-predictive-search-input]',
      underlay: '[data-search-underlay]'
  };
  const classes$k = {
      underlayVisible: 'underlay--visible',
      isVisible: 'is-visible'
  };
  let sections$n = {};
  let SearchPopdownTriggers = class SearchPopdownTriggers {
      initTriggerEvents() {
          this.trigger.setAttribute('aria-haspopup', true);
          this.trigger.setAttribute('aria-expanded', false);
          this.trigger.setAttribute('aria-controls', this.key);
          this.trigger.addEventListener('click', (function(evt) {
              evt.preventDefault();
              this.showPopdown();
          }).bind(this));
          this.trigger.addEventListener('keyup', (function(evt) {
              if (evt.which !== window.theme.keyboardKeys.SPACE) {
                  return;
              }
              this.showPopdown();
          }).bind(this));
      }
      initPopdownEvents() {
          this.popdown.addEventListener('keyup', (function(evt) {
              if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
                  return;
              }
              this.hidePopdown();
          }).bind(this));
          this.close.addEventListener('click', (function() {
              this.hidePopdown();
          }).bind(this));
          this.underlay.addEventListener('click', (function() {
              this.hidePopdown();
          }).bind(this));
      }
      hidePopdown() {
          this.popdown.classList.remove(classes$k.isVisible);
          this.underlay.classList.remove(classes$k.underlayVisible);
          this.trigger.focus();
          this.input.value = '';
          removeTrapFocus();
          this.input.dispatchEvent(new CustomEvent('clear', {
              bubbles: false
          }));
          this.popdown.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
              bubbles: true
          }));
      }
      showPopdown() {
          this.input.value = '';
          this.popdown.classList.add(classes$k.isVisible);
          this.underlay.classList.add(classes$k.underlayVisible);
          trapFocus(this.popdown, {
              elementToFocus: this.input
          });
          this.popdown.dispatchEvent(new CustomEvent('theme:scroll:lock', {
              bubbles: true
          }));
      }
      constructor(trigger){
          this.trigger = trigger;
          this.key = this.trigger.getAttribute(selectors$G.popdownTrigger);
          const popdownSelector = `[id='${this.key}']`;
          this.popdown = document.querySelector(popdownSelector);
          this.input = this.popdown.querySelector(selectors$G.input);
          this.close = this.popdown.querySelector(selectors$G.close);
          this.wrapper = this.popdown.closest(selectors$G.wrapper);
          this.underlay = this.wrapper.querySelector(selectors$G.underlay);
          this.initTriggerEvents();
          this.initPopdownEvents();
      }
  };
  const searchPopdown = {
      onLoad () {
          sections$n[this.id] = {};
          const triggers = this.container.querySelectorAll(`[${selectors$G.popdownTrigger}]`);
          triggers.forEach((trigger)=>{
              sections$n[this.id] = new SearchPopdownTriggers(trigger);
          });
      }
  };

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */ function getSizedImageUrl(src, size) {
      if (size === null) {
          return src;
      }
      if (typeof src === 'undefined' || src === null) {
          src = window.theme.assets.noImage;
      }
      if (size === 'master') {
          return removeProtocol(src);
      }
      const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp)(\?v=\d+)?$/i);
      if (match) {
          const prefix = src.split(match[0]);
          const suffix = match[0];
          return removeProtocol(`${prefix[0]}_${size}${suffix}`);
      } else {
          return null;
      }
  }
  function removeProtocol(path) {
      return path.replace(/http(s)?:/, '');
  }

  const selectors$F = {
      saleClass: 'on-sale',
      soldClass: 'sold-out'
  };
  function formatPrices(product) {
      // Apprend classes for on sale and sold out
      const on_sale = product.price < product.compare_at_price_min;
      let classes = on_sale ? selectors$F.saleClass : '';
      classes += product.available ? '' : selectors$F.soldClass;
      // Add 'from' before min prive if price varies
      product.price = theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.price, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.price, theme.moneyFormat);
      if (product.prive_varies) {
          let min = theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.price_min, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.price_min, theme.moneyFormat);
          product.price = `${window.theme.strings.from} ${min}`;
      }
      const formatted = {
          ...product,
          classes,
          on_sale,
          sold_out: !product.available,
          sold_out_translation: window.theme.strings.soldOut,
          compare_at_price: theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.compare_at_price_min, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.compare_at_price_min, theme.moneyFormat),
          compare_at_price_max: theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.compare_at_price_max, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.compare_at_price_max, theme.moneyFormat),
          compare_at_price_min: theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.compare_at_price_min, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.compare_at_price_min, theme.moneyFormat),
          price_max: theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.price_max, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.price_max, theme.moneyFormat),
          price_min: theme.settings.currency_code_enable ? themeCurrency.formatMoney(product.price_min, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(product.price_min, theme.moneyFormat)
      };
      return formatted;
  }

  const selectors$E = {
      wrapper: '[data-search-popdown-wrap]',
      results: '[data-predictive-search-results]',
      input: '[data-predictive-search-input]',
      productTemplate: '[data-search-product-template]',
      otherTemplate: '[data-search-other-template]',
      titleTemplate: '[data-predictive-search-title-template]',
      ariaTemplate: '[data-predictive-search-aria-template]',
      productTitleWrapper: '[data-product-title-wrap]',
      productWrapper: '[data-product-wrap]',
      collectionWrapper: '[data-collection-wrap]',
      articleWrapper: '[data-article-wrap]',
      pageWrapper: '[data-page-wrap]',
      ariaWrapper: '[data-predictive-search-aria]',
      outerWrapper: '[data-popdown-outer]',
      loader: '[data-loading-indicator]',
      dirtyClass: 'dirty',
      noResults: 'search--empty'
  };
  let sections$m = {};
  Sqrl__namespace.filters.define('animationDelay', function(index) {
      return index * 90 + 10;
  });
  let SearchPredictive = class SearchPredictive {
      initSearch() {
          this.input.addEventListener('input', debounce((function(event) {
              const val = event.target.value;
              if (val && val.length > 1) {
                  this.loader.style.display = 'block';
                  this.render(val);
              } else {
                  this.resetTemplates();
                  this.outer.classList.remove(selectors$E.dirtyClass);
              }
          }).bind(this), 300));
          this.input.addEventListener('clear', this.reset.bind(this));
      }
      render(terms) {
          let resources = '';
          resources += window.theme.settings.search_products ? 'product,' : '';
          resources += window.theme.settings.search_collections ? 'collection,' : '';
          resources += window.theme.settings.search_articles ? 'article,' : '';
          resources += window.theme.settings.search_pages ? 'page,' : '';
          resources = resources.slice(0, -1);
          const serialized = `/search/suggest.json?q=${terms}&resources[type]=${resources}&resources[options][unavailable_products]=last`;
          fetch(serialized).then(this.handleErrors).then((response)=>response.json()
          ).then((response)=>{
              this.resetTemplates();
              this.outer.classList.add(selectors$E.dirtyClass);
              const results = response.resources.results;
              const combined = [];
              for(const key in results){
                  if (({}).hasOwnProperty.call(results, key)) {
                      combined.push(...results[key]);
                  }
              }
              if (combined.length) {
                  this.outer.classList.remove(selectors$E.noResults);
                  this.injectOther(results);
                  this.injectProduct(results.products);
              } else {
                  this.noResults(terms);
              }
              this.injectAria(terms, combined);
              trapFocus(this.outer, {
                  elementToFocus: this.input
              });
          }).catch((e)=>{
              console.error(e);
          }).finally(()=>{
              this.loader.style.display = 'none';
          });
      }
      injectAria(terms, combined) {
          let title = window.theme.strings.noResultsFor;
          let count = null;
          if (combined.length) {
              count = combined.length;
              title = window.theme.strings.resultsFor;
          }
          this.ariaWrapper.innerHTML = Sqrl__namespace.render(this.ariaTemplate, {
              count: count,
              title: title,
              query: terms
          });
      }
      noResults() {
          this.resetTemplates();
          this.outer.classList.add(selectors$E.dirtyClass);
          this.outer.classList.add(selectors$E.noResults);
      }
      resetTemplates() {
          this.productTitleWrapper.innerHTML = '';
          this.collectionWrapper.innerHTML = '';
          this.articleWrapper.innerHTML = '';
          this.productWrapper.innerHTML = '';
          this.pageWrapper.innerHTML = '';
          this.ariaWrapper.innerHTML = '';
      }
      reset() {
          this.resetTemplates();
          this.outer.classList.remove(selectors$E.dirtyClass);
          this.outer.classList.remove(selectors$E.noResults);
          this.input.val = '';
      }
      injectOther(results) {
          const collections = results.collections;
          this.productTitleWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
              title: window.theme.strings.products,
              count: results.products.length
          });
          if (collections && collections.length) {
              for(let index = collections.length - 1; index >= 0; index--){
                  const collection = collections[index];
                  theme.settings.excluded_collections_strict.forEach((excludedCollectionStrict)=>{
                      if (excludedCollectionStrict.trim() == collection.handle) {
                          collections.splice(index, 1);
                      }
                  });
                  theme.settings.excluded_collections.forEach((excludedCollection)=>{
                      if (collection.handle.includes(excludedCollection.trim())) {
                          collections.splice(index, 1);
                      }
                  });
              }
              this.collectionWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
                  title: window.theme.strings.collections,
                  count: collections.length
              });
              this.collectionWrapper.innerHTML += Sqrl__namespace.render(this.otherTemplate, collections);
          }
          if (results.pages && results.pages.length) {
              this.pageWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
                  title: window.theme.strings.pages,
                  count: results.pages.length
              });
              this.pageWrapper.innerHTML += Sqrl__namespace.render(this.otherTemplate, results.pages);
          }
          if (results.articles && results.articles.length) {
              this.articleWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
                  title: window.theme.strings.articles,
                  count: results.articles.length
              });
              this.articleWrapper.innerHTML += Sqrl__namespace.render(this.otherTemplate, results.articles);
          }
      }
      injectProduct(products) {
          let formatted = [];
          products.forEach((p)=>{
              let product = p;
              product = formatPrices(product);
              product.image = null;
              if (product.featured_image && product.featured_image.url) {
                  product.thumb = getSizedImageUrl(product.featured_image.url, '360x360');
                  product.title_strip_html = this.removeHtmlTags(product.title);
              }
              formatted.push(product);
          });
          const productHTML = Sqrl__namespace.render(this.productTemplate, formatted);
          this.productWrapper.innerHTML += productHTML;
      }
      handleErrors(response) {
          if (!response.ok) {
              return response.json().then(function(json) {
                  const e = new FetchError({
                      status: response.statusText,
                      headers: response.headers,
                      json: json
                  });
                  throw e;
              });
          }
          return response;
      }
      removeHtmlTags(str) {
          if (str === null || str === '') {
              return false;
          } else {
              str = str.toString();
          }
          // Regular expression to identify HTML tags in the input string.
          // Replacing the identified HTML tag with a null string.
          return str.replace(/(<([^>]+)>)/gi, '');
      }
      constructor(wrapper){
          this.wrapper = wrapper;
          this.input = this.wrapper.querySelector(selectors$E.input);
          this.loader = this.wrapper.querySelector(selectors$E.loader);
          this.results = this.wrapper.querySelector(selectors$E.results);
          this.outer = this.input.closest(selectors$E.outerWrapper);
          this.productTemplate = this.wrapper.querySelector(selectors$E.productTemplate).innerHTML;
          this.otherTemplate = this.wrapper.querySelector(selectors$E.otherTemplate).innerHTML;
          this.titleTemplate = this.wrapper.querySelector(selectors$E.titleTemplate).innerHTML;
          this.ariaTemplate = this.wrapper.querySelector(selectors$E.ariaTemplate).innerHTML;
          this.productTitleWrapper = this.results.querySelector(selectors$E.productTitleWrapper);
          this.productWrapper = this.results.querySelector(selectors$E.productWrapper);
          this.collectionWrapper = this.results.querySelector(selectors$E.collectionWrapper);
          this.articleWrapper = this.results.querySelector(selectors$E.articleWrapper);
          this.pageWrapper = this.results.querySelector(selectors$E.pageWrapper);
          this.ariaWrapper = this.results.querySelector(selectors$E.ariaWrapper);
          this.initSearch();
      }
  };
  const searchResultsGlobal = {
      onLoad () {
          sections$m[this.id] = [];
          const els = document.querySelectorAll(selectors$E.wrapper);
          els.forEach((el)=>{
              sections$m[this.id].push(new SearchPredictive(el));
          });
      },
      onUnload: function() {
          sections$m[this.id].forEach((el)=>{
              if (typeof el.unload === 'function') {
                  el.unload();
              }
          });
      }
  };

  const selectors$D = {
      popoutWrapper: '[data-popout]',
      popoutList: '[data-popout-list]',
      popoutToggle: 'data-popout-toggle',
      popoutInput: '[data-popout-input]',
      popoutOptions: '[data-popout-option]',
      popoutPrevent: 'data-popout-prevent',
      popoutQuantity: 'data-quantity-field',
      dataValue: 'data-value',
      ariaExpanded: 'aria-expanded',
      ariaCurrent: 'aria-current'
  };
  const classes$j = {
      listVisible: 'popout-list--visible',
      currentSuffix: '--current'
  };
  let PopoutSelect = class PopoutSelect extends HTMLElement {
      unload() {
          if (this.popoutOptions.length) {
              this.popoutOptions.forEach((element)=>{
                  element.removeEventListener('clickDetails', this.popupOptionsClick.bind(this));
                  element.removeEventListener('click', this._connectOptionsDispatch.bind(this));
              });
          }
          this.popoutToggle.removeEventListener('click', this.popupToggleClick.bind(this));
          this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));
          this.popoutList.removeEventListener('focusout', this.popupListFocusout.bind(this));
          this.container.removeEventListener('keyup', this.containerKeyup.bind(this));
          if (this.outsidePopupToggle) {
              this.outsidePopupToggle.removeEventListener('click', this.popupToggleClick.bind(this));
              this.outsidePopupToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));
          }
      }
      popupToggleClick(evt) {
          const ariaExpanded = evt.currentTarget.getAttribute(selectors$D.ariaExpanded) === 'true';
          evt.currentTarget.setAttribute(selectors$D.ariaExpanded, !ariaExpanded);
          this.popoutList.classList.toggle(classes$j.listVisible);
      }
      popupToggleFocusout(evt) {
          const popoutLostFocus = this.container.contains(evt.relatedTarget);
          if (!popoutLostFocus) {
              this._hideList();
          }
      }
      popupListFocusout(evt) {
          const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
          const isVisible = this.popoutList.classList.contains(classes$j.listVisible);
          if (isVisible && !childInFocus) {
              this._hideList();
          }
      }
      popupOptionsClick(evt) {
          const link = evt.target.closest(selectors$D.popoutOptions);
          if (link.attributes.href.value === '#') {
              evt.preventDefault();
              let attrValue = '';
              if (evt.currentTarget.getAttribute(selectors$D.dataValue)) {
                  attrValue = evt.currentTarget.getAttribute(selectors$D.dataValue);
              }
              this.popoutInput.value = attrValue;
              if (this.popoutPrevent) {
                  this.popoutInput.dispatchEvent(new Event('change'));
                  if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(selectors$D.popoutQuantity)) {
                      this.popoutInput.dispatchEvent(new Event('input'));
                  }
                  const currentElement = this.popoutList.querySelector(`[class*="${classes$j.currentSuffix}"]`);
                  let targetClass = classes$j.currentSuffix;
                  if (currentElement && currentElement.classList.length) {
                      for (const currentElementClass of currentElement.classList){
                          if (currentElementClass.includes(classes$j.currentSuffix)) {
                              targetClass = currentElementClass;
                              break;
                          }
                      }
                  }
                  const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);
                  if (listTargetElement) {
                      listTargetElement.classList.remove(`${targetClass}`);
                      evt.currentTarget.parentElement.classList.add(`${targetClass}`);
                  }
                  const targetAttribute = this.popoutList.querySelector(`[${selectors$D.ariaCurrent}]`);
                  if (targetAttribute && targetAttribute.hasAttribute(`${selectors$D.ariaCurrent}`)) {
                      targetAttribute.removeAttribute(`${selectors$D.ariaCurrent}`);
                      evt.currentTarget.setAttribute(`${selectors$D.ariaCurrent}`, 'true');
                  }
                  if (attrValue !== '') {
                      this.popoutToggle.textContent = attrValue;
                      if (this.outsidePopupToggle) {
                          this.outsidePopupToggle.textContent = attrValue;
                      }
                  }
                  this.popupToggleFocusout(evt);
                  this.popupListFocusout(evt);
              } else {
                  this._submitForm(attrValue);
              }
          }
      }
      updatePopout(evt) {
          const targetElement = this.popoutList.querySelector(`[${selectors$D.dataValue}="${this.popoutInput.value}"]`);
          if (targetElement) {
              targetElement.dispatchEvent(new CustomEvent('clickDetails', {
                  cancelable: true,
                  bubbles: true,
                  detail: {
                      preventTrigger: true
                  }
              }));
          }
      }
      containerKeyup(evt) {
          if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
              return;
          }
          this._hideList();
          this.popoutToggle.focus();
      }
      bodyClick(evt) {
          const isOption = this.container.contains(evt.target);
          const isVisible = this.popoutList.classList.contains(classes$j.listVisible);
          const isOutside = this.outsidePopupToggle === evt.target;
          if (isVisible && !isOption && !isOutside) {
              this._hideList();
          }
      }
      _connectToggle() {
          this.popoutToggle.addEventListener('click', this.popupToggleClick.bind(this));
          if (this.outsidePopupToggle) {
              this.outsidePopupToggle.addEventListener('click', this.popupToggleClick.bind(this));
          }
      }
      _connectOptions() {
          if (this.popoutOptions.length) {
              this.popoutOptions.forEach((element)=>{
                  element.addEventListener('clickDetails', this.popupOptionsClick.bind(this));
                  element.addEventListener('click', this._connectOptionsDispatch.bind(this));
              });
          }
      }
      _connectOptionsDispatch(evt) {
          const event = new CustomEvent('clickDetails', {
              cancelable: true,
              bubbles: true,
              detail: {
                  preventTrigger: false
              }
          });
          if (!evt.target.dispatchEvent(event)) {
              evt.preventDefault();
          }
      }
      _onFocusOut() {
          this.popoutToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));
          if (this.outsidePopupToggle) {
              this.outsidePopupToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));
          }
          this.popoutList.addEventListener('focusout', this.popupListFocusout.bind(this));
          this.container.addEventListener('keyup', this.containerKeyup.bind(this));
          document.body.addEventListener('click', this.bodyClick.bind(this));
      }
      _submitForm(value) {
          const form = this.container.closest('form');
          if (form) {
              form.submit();
          }
      }
      _hideList() {
          this.popoutList.classList.remove(classes$j.listVisible);
          this.popoutToggle.setAttribute(selectors$D.ariaExpanded, false);
          if (this.outsidePopupToggle) {
              this.outsidePopupToggle.setAttribute(selectors$D.ariaExpanded, false);
          }
      }
      constructor(){
          super();
          this.container = this.querySelector(selectors$D.popoutWrapper);
          this.popoutList = this.container.querySelector(selectors$D.popoutList);
          this.popoutToggle = this.container.querySelector(`[${selectors$D.popoutToggle}]`);
          this.outsidePopupToggle = document.querySelector(`[${selectors$D.popoutToggle}="${this.popoutList.id}"]`);
          this.popoutInput = this.container.querySelector(selectors$D.popoutInput);
          this.popoutOptions = this.container.querySelectorAll(selectors$D.popoutOptions);
          this.popoutPrevent = this.container.getAttribute(selectors$D.popoutPrevent) === 'true';
          this._connectOptions();
          this._connectToggle();
          this._onFocusOut();
          if (this.popoutInput && this.popoutInput.hasAttribute(selectors$D.popoutQuantity)) {
              document.addEventListener('popout:updateValue', this.updatePopout.bind(this));
          }
      }
  };

  const selectors$C = {
      frame: '[data-header-mobile] [data-ticker-frame]',
      scale: '[data-ticker-scale]',
      text: '[data-ticker-text]',
      spaceWrapper: '[data-takes-space-wrapper]',
      clone: 'data-clone',
      header: '[data-header-wrapper]'
  };
  const classes$i = {
      isMobileView: 'js__show__mobile',
      animationClass: 'ticker--animated'
  };
  const variables$1 = {
      moveTime: 1.63,
      space: 100
  };
  const sections$l = {};
  let Ticker = class Ticker {
      unload() {
          document.removeEventListener('theme:resize', this.resizeEvent);
      }
      listen() {
          document.addEventListener('theme:resize', this.resizeEvent);
          this.checkWidth();
      }
      checkWidth() {
          const padding = window.getComputedStyle(this.spaceWrapper).paddingLeft.replace('px', '') * 2;
          const clone = this.scale.querySelector(`[${selectors$C.clone}]`);
          if ((this.header.classList.contains(classes$i.isMobileView) || window.innerWidth < window.theme.sizes.small) && this.spaceWrapper.clientWidth - padding < this.text.clientWidth) {
              if (clone) {
                  return;
              }
              this.scale.classList.add(classes$i.animationClass);
              this.clone = this.text.cloneNode(true);
              this.clone.setAttribute(selectors$C.clone, '');
              this.scale.appendChild(this.clone);
              const animationTimeFrame = this.text.clientWidth / variables$1.space * variables$1.moveTime;
              this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
          } else {
              const clone = this.scale.querySelector(`[${selectors$C.clone}]`);
              if (clone) {
                  this.scale.removeChild(clone);
              }
              this.scale.classList.remove(classes$i.animationClass);
          }
      }
      constructor(el){
          this.frame = el;
          this.scale = this.frame.querySelector(selectors$C.scale);
          this.text = this.frame.querySelector(selectors$C.text);
          this.spaceWrapper = this.frame.parentNode;
          this.header = document.querySelector(selectors$C.header);
          this.resizeEvent = debounce(()=>this.checkWidth()
          , 100);
          this.listen();
      }
  };
  const ticker = {
      onLoad () {
          sections$l[this.id] = [];
          const el1 = this.container.querySelectorAll(selectors$C.frame);
          el1.forEach((el)=>{
              sections$l[this.id].push(new Ticker(el));
          });
      },
      onUnload () {
          sections$l[this.id].forEach((el)=>{
              if (typeof el.unload === 'function') {
                  el.unload();
              }
          });
      }
  };

  const selectors$B = {
      slideruleOpen: 'data-sliderule-open',
      slideruleClose: 'data-sliderule-close',
      sliderulePane: 'data-sliderule-pane',
      slideruleWrappper: '[data-sliderule]',
      dataAnimates: 'data-animates',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      children: `:scope > [data-animates],
             :scope > * > [data-animates],
             :scope > * > * > [data-animates],
             :scope > * > * > * > [data-animates],
             :scope > * > * > * > * > [data-animates],
             :scope > * > .sliderule-grid  > *`
  };
  const classes$h = {
      isVisible: 'is-visible',
      isHiding: 'is-hiding',
      isHidden: 'is-hidden'
  };
  let sections$k = {};
  let HeaderMobileSliderule = class HeaderMobileSliderule {
      clickEvents() {
          this.trigger.addEventListener('click', (function() {
              this.showSliderule();
          }).bind(this));
          this.exit.forEach((element)=>{
              element.addEventListener('click', (function() {
                  this.hideSliderule();
              }).bind(this));
          });
      }
      keyboardEvents() {
          this.trigger.addEventListener('keyup', (function(evt) {
              if (evt.which !== window.theme.keyboardKeys.SPACE) {
                  return;
              }
              this.showSliderule();
          }).bind(this));
          this.sliderule.addEventListener('keyup', (function(evt) {
              if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
                  return;
              }
              this.hideSliderule();
              this.buttons[0].focus();
          }).bind(this));
      }
      staggerChildAnimations(reverse = false) {
          const childrenArr = reverse ? Array.prototype.slice.call(this.children).slice().reverse() : this.children;
          childrenArr.forEach((child, index)=>{
              child.style.transitionDelay = `${index * 50 + 10}ms`;
          });
      }
      scrollSliderule() {
          const scrollableElements = document.querySelectorAll(`[${selectors$B.sliderulePane}], ${selectors$B.slideruleWrappper}.is-visible`);
          if (scrollableElements.length) {
              scrollableElements.forEach((element)=>{
                  if (element.scrollTop > 0) {
                      element.scrollTop = 0;
                  }
              });
          }
      }
      hideSliderule(close = false) {
          this.scrollSliderule();
          const paneStyle = window.getComputedStyle(this.pane);
          const paneTransitionDuration = parseFloat(paneStyle.getPropertyValue('transition-duration')) * 1000;
          const children = close ? this.pane.querySelectorAll(`.${classes$h.isVisible}`) : this.children;
          this.pane.style.setProperty('--sliderule-height', 'auto');
          this.staggerChildAnimations(true);
          this.pane.classList.add(classes$h.isHiding);
          this.sliderule.classList.add(classes$h.isHiding);
          this.sliderule.classList.remove(classes$h.isVisible);
          children.forEach((el)=>{
              el.classList.remove(classes$h.isVisible);
          });
          const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
          this.pane.setAttribute(selectors$B.sliderulePane, newPosition);
          const hidedSelector = close ? `[${selectors$B.dataAnimates}].${classes$h.isHidden}` : `[${selectors$B.dataAnimates}="${newPosition}"].${classes$h.isHidden}`;
          const hidedItems = this.pane.querySelectorAll(hidedSelector);
          if (hidedItems.length) {
              hidedItems.forEach((element)=>{
                  element.classList.remove(classes$h.isHidden);
              });
          }
          setTimeout(()=>{
              this.pane.classList.remove(classes$h.isHiding);
              this.sliderule.classList.remove(classes$h.isHiding);
              this.staggerChildAnimations();
          }, paneTransitionDuration);
          const newHeight = parseInt(this.trigger.parentElement.parentElement.offsetHeight);
          this.pane.style.setProperty('--sliderule-height', `${newHeight}px`);
      }
      showSliderule() {
          this.scrollSliderule();
          this.pane.style.setProperty('--sliderule-height', 'auto');
          this.sliderule.classList.add(classes$h.isVisible);
          this.children.forEach((el)=>{
              el.classList.add(classes$h.isVisible);
          });
          const oldPosition = parseInt(this.pane.dataset.sliderulePane, 10);
          const newPosition = oldPosition + 1;
          this.pane.setAttribute(selectors$B.sliderulePane, newPosition);
          const hidedItems = this.pane.querySelectorAll(`[${selectors$B.dataAnimates}="${oldPosition}"]`);
          if (hidedItems.length) {
              const hidedItemsTransition = parseFloat(window.getComputedStyle(hidedItems[0]).getPropertyValue('transition-duration')) * 1000;
              setTimeout(()=>{
                  hidedItems.forEach((element)=>{
                      element.classList.add(classes$h.isHidden);
                  });
              }, hidedItemsTransition);
          }
          const newHeight = parseInt(this.trigger.nextElementSibling.offsetHeight);
          this.pane.style.setProperty('--sliderule-height', `${newHeight}px`);
      }
      closeSliderule() {
          if (this.pane && this.pane.hasAttribute(selectors$B.sliderulePane) && parseInt(this.pane.getAttribute(selectors$B.sliderulePane)) > 0) {
              this.hideSliderule(true);
              if (parseInt(this.pane.getAttribute(selectors$B.sliderulePane)) > 0) {
                  this.pane.setAttribute(selectors$B.sliderulePane, 0);
              }
          }
      }
      constructor(el){
          this.sliderule = el;
          this.wrapper = el.closest(selectors$B.wrapper);
          this.key = this.sliderule.id;
          const btnSelector = `[${selectors$B.slideruleOpen}='${this.key}']`;
          const exitSelector = `[${selectors$B.slideruleClose}='${this.key}']`;
          this.trigger = document.querySelector(btnSelector);
          this.exit = document.querySelectorAll(exitSelector);
          this.pane = document.querySelector(`[${selectors$B.sliderulePane}]`);
          this.children = this.sliderule.querySelectorAll(selectors$B.children);
          this.trigger.setAttribute('aria-haspopup', true);
          this.trigger.setAttribute('aria-expanded', false);
          this.trigger.setAttribute('aria-controls', this.key);
          this.clickEvents();
          this.staggerChildAnimations();
          document.addEventListener('theme:sliderule:close', this.closeSliderule.bind(this));
      }
  };
  const headerMobileSliderule = {
      onLoad () {
          sections$k[this.id] = [];
          const els = this.container.querySelectorAll(selectors$B.slideruleWrappper);
          els.forEach((el)=>{
              sections$k[this.id].push(new HeaderMobileSliderule(el));
          });
      }
  };

  const showElement = (elem, removeProp = false, prop = 'block')=>{
      if (elem) {
          if (removeProp) {
              elem.style.removeProperty('display');
          } else {
              elem.style.display = prop;
          }
      }
  };

  const selectors$A = {
      accordionGroup: '[data-accordion-group]',
      accordionToggle: 'data-accordion-trigger',
      accordionBody: '[data-accordion-body]',
      accordionBodyMobile: 'data-accordion-body-mobile',
      rangeSlider: 'data-range-holder',
      section: '[data-section-id]'
  };
  const classes$g = {
      open: 'accordion-is-open'
  };
  let sections$j = {};
  let Accordion = class Accordion {
      mobileAccordions() {
          if (window.innerWidth < window.theme.sizes.medium) {
              this.init();
              this.setDefaultState();
          } else {
              this.resetMobileAccordions();
              this.body.removeAttribute('style');
          }
          document.addEventListener('theme:resize', ()=>{
              if (window.innerWidth < window.theme.sizes.medium) {
                  this.init();
                  this.setDefaultState();
              } else {
                  this.resetMobileAccordions();
                  this.body.removeAttribute('style');
              }
          });
      }
      init() {
          this.trigger.setAttribute('aria-haspopup', true);
          this.trigger.setAttribute('aria-expanded', false);
          this.trigger.setAttribute('aria-controls', this.key);
          this.setDefaultState();
          this.trigger.addEventListener('click', this.toggleEvent);
          this.body.addEventListener('keyup', this.keyboardEvent);
          this.body.addEventListener('theme:accordion:close', this.hideEvent);
      }
      hideEvents() {
          this.hideAccordion();
      }
      clickEvents(e) {
          e.preventDefault();
          this.toggleState();
      }
      keyboardEvents(e) {
          if (e.which !== window.theme.keyboardKeys.ESCAPE) {
              return;
          }
          this.hideAccordion();
          this.trigger.focus();
      }
      resetMobileAccordions() {
          this.trigger.removeEventListener('click', this.toggleEvent);
          this.body.removeEventListener('keyup', this.keyboardEvent);
          this.body.removeEventListener('theme:accordion:close', this.hideEvent);
      }
      setDefaultState() {
          if (this.trigger.classList.contains(classes$g.open)) {
              showElement(this.body);
          } else {
              this.hideAccordion();
          }
      }
      getSiblings() {
          const section = this.body.closest(selectors$A.section);
          const groupsArray = [
              ...section.querySelectorAll(selectors$A.accordionGroup)
          ];
          const syncWrapper = groupsArray.filter((el)=>el.contains(this.body)
          ).shift();
          if (syncWrapper) {
              const allChilden = [
                  ...syncWrapper.querySelectorAll(selectors$A.accordionBody)
              ];
              const onlySiblings = allChilden.filter((el)=>!el.contains(this.body)
              );
              return onlySiblings;
          } else return [];
      }
      closeSiblings() {
          this.syncBodies.forEach((accordionBody)=>{
              accordionBody.dispatchEvent(new CustomEvent('theme:accordion:close', {
                  bubbles: false
              }));
          });
      }
      toggleState() {
          if (this.trigger.classList.contains(classes$g.open)) {
              this.hideAccordion();
          } else {
              this.showAccordion();
              this.closeSiblings();
              // Collection filters
              // Accordion with range slider custom event to reload
              if (this.body.hasAttribute(selectors$A.rangeSlider)) {
                  setTimeout(()=>{
                      document.dispatchEvent(new CustomEvent('theme:reset-price-range', {
                          bubbles: false
                      }));
                  }, 400);
              }
          }
      }
      hideAccordion() {
          this.trigger.classList.remove(classes$g.open);
          slideUp(this.body);
      }
      showAccordion() {
          this.trigger.classList.add(classes$g.open);
          slideDown(this.body);
      }
      onBlockSelect(evt) {
          if (this.body.contains(evt.target)) {
              this.showAccordion();
          }
      }
      onBlockDeselect(evt) {
          if (this.body.contains(evt.target)) {
              this.hideAccordion();
          }
      }
      constructor(el){
          this.body = el;
          this.key = this.body.id;
          const btnSelector = `[${selectors$A.accordionToggle}='${this.key}']`;
          this.trigger = document.querySelector(btnSelector);
          this.toggleEvent = (e)=>this.clickEvents(e)
          ;
          this.keyboardEvent = (e)=>this.keyboardEvents(e)
          ;
          this.hideEvent = ()=>this.hideEvents()
          ;
          this.syncBodies = this.getSiblings();
          if (this.body.hasAttribute(selectors$A.accordionBodyMobile)) {
              this.mobileAccordions();
          } else {
              this.init();
          }
      }
  };
  const accordion = {
      onLoad () {
          sections$j[this.id] = [];
          const els = this.container.querySelectorAll(selectors$A.accordionBody);
          els.forEach((el)=>{
              sections$j[this.id].push(new Accordion(el));
          });
      },
      onUnload: function() {
          sections$j[this.id].forEach((el)=>{
              if (typeof el.unload === 'function') {
                  el.unload();
              }
          });
      },
      onSelect: function() {
          if (this.type === 'accordion-single') {
              this.container.querySelector(`[${selectors$A.accordionToggle}]`).click();
          }
      },
      onDeselect: function() {
          if (this.type === 'accordion-single') {
              this.container.querySelector(`[${selectors$A.accordionToggle}]`).click();
          }
      },
      onBlockSelect (evt) {
          sections$j[this.id].forEach((el)=>{
              if (typeof el.onBlockSelect === 'function') {
                  el.onBlockSelect(evt);
              }
          });
      },
      onBlockDeselect (evt) {
          sections$j[this.id].forEach((el)=>{
              if (typeof el.onBlockSelect === 'function') {
                  el.onBlockDeselect(evt);
              }
          });
      }
  };

  const selectors$z = {
      wrapper: '[data-header-wrapper]',
      html: 'html',
      style: 'data-header-style',
      widthContentWrapper: '[data-takes-space-wrapper]',
      widthContent: '[data-child-takes-space]',
      desktop: '[data-header-desktop]',
      cloneClass: 'js__header__clone',
      showMobileClass: 'js__show__mobile',
      backfill: '[data-header-backfill]',
      transparent: 'data-header-transparent',
      overrideBorder: 'header-override-border',
      firstSectionHasImage: '.main-content > .shopify-section:first-child [data-overlay-header]',
      preventTransparentHeader: '.main-content > .shopify-section:first-child [data-prevent-transparent-header]',
      deadLink: '.navlink[href="#"]'
  };
  let sections$i = {};
  let Header = class Header {
      unload() {
          document.removeEventListener('theme:resize:width', this.resizeEventWidth);
          document.removeEventListener('theme:resize:width', this.resizeEventOverlay);
      }
      checkForImage() {
          // check again for overlayed images
          this.overlayedImages = document.querySelectorAll(selectors$z.firstSectionHasImage);
          let preventTransparentHeader = document.querySelectorAll(selectors$z.preventTransparentHeader).length;
          if (this.overlayedImages.length && !preventTransparentHeader && this.isTransparentHeader) {
              // is transparent and has image, overlay the image
              this.listenOverlay();
              this.wrapper.setAttribute(selectors$z.transparent, true);
              document.querySelector(selectors$z.backfill).style.display = 'none';
              theme.transparentHeader = true;
          } else {
              this.wrapper.setAttribute(selectors$z.transparent, false);
              document.querySelector(selectors$z.backfill).style.display = 'block';
              theme.transparentHeader = false;
          }
          if (this.overlayedImages.length && !preventTransparentHeader && !this.isTransparentHeader) {
              // Have image but not transparent, remove border bottom
              this.wrapper.classList.add(selectors$z.overrideBorder);
              this.subtractHeaderHeight();
          }
      }
      listenOverlay() {
          document.addEventListener('theme:resize:width', this.resizeEventOverlay);
          this.subtractAnnouncementHeight();
      }
      listenWidth() {
          document.addEventListener('theme:resize:width', this.resizeEventWidth);
          this.checkWidth();
      }
      killDeadLinks() {
          this.deadLinks.forEach((el)=>{
              el.onclick = (e)=>{
                  e.preventDefault();
              };
          });
      }
      subtractAnnouncementHeight() {
          const { windowHeight , announcementHeight , headerHeight  } = readHeights();
          this.overlayedImages.forEach((el)=>{
              el.style.setProperty('--full-screen', `${windowHeight - announcementHeight}px`);
              el.style.setProperty('--header-padding', `${headerHeight}px`);
              el.classList.add('has-overlay');
          });
      }
      subtractHeaderHeight() {
          const { windowHeight , headerHeight  } = readHeights();
          this.overlayedImages.forEach((el)=>{
              el.style.setProperty('--full-screen', `${windowHeight - headerHeight}px`);
          });
      }
      checkWidth() {
          if (document.body.clientWidth < this.minWidth || document.body.clientWidth < window.theme.sizes.medium) {
              this.wrapper.classList.add(selectors$z.showMobileClass);
          } else {
              this.wrapper.classList.remove(selectors$z.showMobileClass);
          }
      }
      getMinWidth() {
          const comparitor = this.wrapper.cloneNode(true);
          comparitor.classList.add(selectors$z.cloneClass);
          document.body.appendChild(comparitor);
          const widthWrappers = comparitor.querySelectorAll(selectors$z.widthContentWrapper);
          let minWidth = 0;
          let spaced = 0;
          widthWrappers.forEach((context)=>{
              const wideElements = context.querySelectorAll(selectors$z.widthContent);
              let thisWidth = 0;
              if (wideElements.length === 3) {
                  thisWidth = _sumSplitWidths(wideElements);
              } else {
                  thisWidth = _sumWidths(wideElements);
              }
              if (thisWidth > minWidth) {
                  minWidth = thisWidth;
                  spaced = wideElements.length * 20;
              }
          });
          document.body.removeChild(comparitor);
          return minWidth + spaced;
      }
      constructor(el){
          this.wrapper = el;
          this.html = document.querySelector(selectors$z.html);
          this.style = this.wrapper.dataset.style;
          this.desktop = this.wrapper.querySelector(selectors$z.desktop);
          this.isTransparentHeader = this.wrapper.getAttribute(selectors$z.transparent) !== 'false';
          this.overlayedImages = document.querySelectorAll(selectors$z.firstSectionHasImage);
          this.deadLinks = document.querySelectorAll(selectors$z.deadLink);
          this.resizeEventWidth = ()=>this.checkWidth()
          ;
          this.resizeEventOverlay = ()=>this.subtractAnnouncementHeight()
          ;
          this.killDeadLinks();
          if (this.style !== 'drawer' && this.desktop) {
              this.minWidth = this.getMinWidth();
              this.listenWidth();
          }
          this.checkForImage();
          document.addEventListener('theme:header:check', this.checkForImage.bind(this));
          this.html.style.setProperty('--scrollbar-width', `${window.innerWidth - this.html.clientWidth}px`);
      }
  };
  function _sumSplitWidths(nodes) {
      let arr = [];
      nodes.forEach((el)=>{
          if (el.firstElementChild) {
              arr.push(el.firstElementChild.clientWidth);
          }
      });
      if (arr[0] > arr[2]) {
          arr[2] = arr[0];
      } else {
          arr[0] = arr[2];
      }
      const width = arr.reduce((a, b)=>a + b
      );
      return width;
  }
  function _sumWidths(nodes) {
      let width = 0;
      nodes.forEach((el)=>{
          width += el.clientWidth;
      });
      return width;
  }
  const header = {
      onLoad () {
          sections$i = new Header(this.container);
          setVarsOnResize();
      },
      onUnload () {
          if (typeof sections$i.unload === 'function') {
              sections$i.unload();
          }
      }
  };
  register('header', [
      header,
      drawer,
      headerMobileSliderule,
      cartDrawer,
      stickyHeader,
      hoverDisclosure,
      headerTotals,
      searchPopdown,
      searchResultsGlobal,
      accordion,
      ticker
  ]);
  if (!customElements.get('popout-select')) {
      customElements.define('popout-select', PopoutSelect);
  }

  register('accordion', accordion);

  const hideElement = (elem)=>{
      if (elem) {
          elem.style.display = 'none';
      }
  };

  const selectors$y = {
      sort: '[data-sort-enabled]',
      sortLinks: '[data-sort-link]',
      sortValue: 'data-value'
  };
  let sections$h = {};
  let Sort = class Sort {
      init() {
          if (this.sort) {
              this.initClick();
          }
      }
      onClick(e) {
          e.preventDefault();
          const sort1 = e.currentTarget.getAttribute(selectors$y.sortValue);
          const url = new window.URL(window.location.href);
          const params = url.searchParams;
          params.set('sort_by', sort1);
          url.search = params.toString();
          window.location.replace(url.toString());
      }
      initClick() {
          if (this.sortLinks.length) {
              this.sortLinks.forEach((link)=>{
                  link.addEventListener('click', (e)=>this.onClick(e)
                  );
              });
          }
      }
      constructor(section){
          this.container = section.container;
          this.sort = this.container.querySelector(selectors$y.sort);
          this.sortLinks = this.container.querySelectorAll(selectors$y.sortLinks);
          this.init();
      }
  };
  const sort = {
      onLoad () {
          sections$h[this.id] = new Sort(this);
      }
  };

  const throttle = (fn, wait)=>{
      let prev, next;
      return function invokeFn(...args) {
          const now = Date.now();
          next = clearTimeout(next);
          if (!prev || now - prev >= wait) {
              // eslint-disable-next-line prefer-spread
              fn.apply(null, args);
              prev = now;
          } else {
              next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
          }
      };
  };

  const selectors$x = {
      filtersWrappper: 'data-filters',
      form: 'data-sidebar-filter-form',
      filtersHideDesktop: 'data-default-hide',
      filtersToggle: 'data-filters-toggle',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      groupHeading: 'data-group-heading',
      showMore: 'data-show-more'
  };
  const classes$f = {
      show: 'drawer--visible',
      defaultVisible: 'filters--default-visible',
      hide: 'hidden',
      expand: 'is-expanded',
      hidden: 'is-hidden'
  };
  const sections$g = {};
  let Filters = class Filters {
      unload() {
          if (this.filtersToggleButtons.length) {
              this.filtersToggleButtons.forEach((element)=>{
                  element.removeEventListener('click', this.connectToggleMemory);
              });
          }
          if (this.showMoreButtons.length) {
              this.showMoreButtons.forEach((button)=>{
                  button.addEventListener('click', this.connectShowHiddenOptions);
              });
          }
      }
      expandingEvents() {
          if (this.showMoreButtons.length) {
              this.showMoreButtons.forEach((button)=>{
                  button.addEventListener('click', throttle(this.connectShowHiddenOptions, 500));
              });
          }
      }
      showHiddenOptions(evt) {
          const element = evt.target.hasAttribute(selectors$x.showMore) ? evt.target : evt.target.closest(`[${selectors$x.showMore}]`);
          element.classList.add(classes$f.hidden);
          element.previousElementSibling.querySelectorAll(`.${classes$f.hidden}`).forEach((option)=>{
              option.classList.remove(classes$f.hidden);
          });
      }
      connectToggle() {
          this.filtersToggleButtons.forEach((button)=>{
              button.addEventListener('click', this.connectToggleMemory.bind(this));
          });
      }
      connectToggleFunction(evt) {
          if (window.innerWidth < window.theme.sizes.medium) {
              const ariaExpanded = evt.currentTarget.getAttribute('aria-expanded') === 'true';
              if (ariaExpanded) {
                  this.hideFilters();
              } else {
                  this.showFilters();
              }
          }
      }
      showFilters() {
          // animates after display none is removed
          setTimeout(()=>{
              this.filtersToggleButtons.forEach((btn)=>btn.setAttribute('aria-expanded', true)
              );
              this.filtersToggleButtons.forEach((btn)=>btn.classList.add(classes$f.show)
              );
              this.form.classList.add(classes$f.show);
              this.form.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                  bubbles: true
              }));
              this.form.querySelector(selectors$x.focusable).focus();
          }, 10);
      }
      hideFilters() {
          this.filtersToggleButtons.forEach((btn)=>btn.setAttribute('aria-expanded', false)
          );
          this.filtersToggleButtons.forEach((btn)=>btn.classList.remove(classes$f.show)
          );
          this.filtersToggleButtons.forEach((btn)=>btn.classList.remove(classes$f.defaultVisible)
          );
          this.form.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
              bubbles: true
          }));
          this.form.classList.remove(classes$f.show);
      }
      constructor(filters){
          this.container = filters;
          this.groupHeadings = this.container.querySelectorAll(`[${selectors$x.groupHeading}]`);
          this.showMoreButtons = this.container.querySelectorAll(`[${selectors$x.showMore}]`);
          this.form = this.container.querySelector(`[${selectors$x.form}]`);
          const triggerKey = this.form.getAttribute(selectors$x.form);
          const selector = `[${selectors$x.filtersToggle}='${triggerKey}']`;
          this.filtersToggleButtons = document.querySelectorAll(selector);
          this.connectToggleMemory = (evt)=>this.connectToggleFunction(evt)
          ;
          this.connectShowHiddenOptions = (evt)=>this.showHiddenOptions(evt)
          ;
          this.connectToggle();
          this.expandingEvents();
      }
  };
  const collectionFiltersSidebar = {
      onLoad () {
          sections$g[this.id] = [];
          const wrappers = this.container.querySelectorAll(`[${selectors$x.filtersWrappper}]`);
          wrappers.forEach((wrapper)=>{
              sections$g[this.id].push(new Filters(wrapper));
          });
      },
      onUnload: function() {
          sections$g[this.id].forEach((filters)=>{
              if (typeof filters.unload === 'function') {
                  filters.unload();
              }
          });
      }
  };

  const selectors$w = {
      rangeSlider: '[data-range-slider]',
      rangeDotLeft: '[data-range-left]',
      rangeDotRight: '[data-range-right]',
      rangeLine: '[data-range-line]',
      rangeHolder: '[data-range-holder]',
      dataMin: 'data-se-min',
      dataMax: 'data-se-max',
      dataMinValue: 'data-se-min-value',
      dataMaxValue: 'data-se-max-value',
      dataStep: 'data-se-step',
      dataFilterUpdate: 'data-range-filter-update',
      priceMin: '[data-field-price-min]',
      priceMax: '[data-field-price-max]'
  };
  const classes$e = {
      isInitialized: 'is-initialized'
  };
  let RangeSlider = class RangeSlider {
      init() {
          this.setDefaultValues();
          // link events
          this.touchLeft.addEventListener('mousedown', this.onStartEvent);
          this.touchRight.addEventListener('mousedown', this.onStartEvent);
          this.touchLeft.addEventListener('touchstart', this.onStartEvent);
          this.touchRight.addEventListener('touchstart', this.onStartEvent);
          // initialize
          this.slider.classList.add(classes$e.isInitialized);
      }
      setDefaultValues() {
          // retrieve default values
          let defaultMinValue = this.min;
          if (this.slider.hasAttribute(selectors$w.dataMinValue)) {
              defaultMinValue = parseFloat(this.slider.getAttribute(selectors$w.dataMinValue));
          }
          let defaultMaxValue = this.max;
          if (this.slider.hasAttribute(selectors$w.dataMaxValue)) {
              defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$w.dataMaxValue));
          }
          // check values are correct
          if (defaultMinValue < this.min) {
              defaultMinValue = this.min;
          }
          if (defaultMaxValue > this.max) {
              defaultMaxValue = this.max;
          }
          if (defaultMinValue > defaultMaxValue) {
              defaultMinValue = defaultMaxValue;
          }
          if (this.slider.getAttribute(selectors$w.dataStep)) {
              this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$w.dataStep)));
          }
          // initial reset
          this.reset();
          // usefull values, min, max, normalize fact is the width of both touch buttons
          this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
          this.selectedTouch = null;
          this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;
          // set defualt values
          this.setMinValue(defaultMinValue);
          this.setMaxValue(defaultMaxValue);
      }
      reset() {
          this.touchLeft.style.left = '0px';
          this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
          this.lineSpan.style.marginLeft = '0px';
          this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
          this.startX = 0;
          this.x = 0;
      }
      setMinValue(minValue) {
          const ratio = (minValue - this.min) / (this.max - this.min);
          this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
          this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
          this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
          this.slider.setAttribute(selectors$w.dataMinValue, minValue);
      }
      setMaxValue(maxValue) {
          const ratio = (maxValue - this.min) / (this.max - this.min);
          this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
          this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
          this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
          this.slider.setAttribute(selectors$w.dataMaxValue, maxValue);
      }
      onStart(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          let eventTouch = event;
          if (event.touches) {
              eventTouch = event.touches[0];
          }
          if (event.currentTarget === this.touchLeft) {
              this.x = this.touchLeft.offsetLeft;
          } else if (event.currentTarget === this.touchRight) {
              this.x = this.touchRight.offsetLeft;
          }
          this.startX = eventTouch.pageX - this.x;
          this.selectedTouch = event.currentTarget;
          document.addEventListener('mousemove', this.onMoveEvent);
          document.addEventListener('mouseup', this.onStopEvent);
          document.addEventListener('touchmove', this.onMoveEvent);
          document.addEventListener('touchend', this.onStopEvent);
      }
      onMove(event) {
          let eventTouch = event;
          if (event.touches) {
              eventTouch = event.touches[0];
          }
          this.x = eventTouch.pageX - this.startX;
          if (this.selectedTouch === this.touchLeft) {
              if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
                  this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
              } else if (this.x < 0) {
                  this.x = 0;
              }
              this.selectedTouch.style.left = this.x + 'px';
          } else if (this.selectedTouch === this.touchRight) {
              if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
                  this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
              } else if (this.x > this.maxX) {
                  this.x = this.maxX;
              }
              this.selectedTouch.style.left = this.x + 'px';
          }
          // update line span
          this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
          this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
          // write new value
          this.calculateValue();
          // call on change
          if (this.slider.getAttribute('on-change')) {
              const fn = new Function('min, max', this.slider.getAttribute('on-change'));
              fn(this.slider.getAttribute(selectors$w.dataMinValue), this.slider.getAttribute(selectors$w.dataMaxValue));
          }
          this.onChange(this.slider.getAttribute(selectors$w.dataMinValue), this.slider.getAttribute(selectors$w.dataMaxValue));
      }
      onStop(event) {
          document.removeEventListener('mousemove', this.onMoveEvent);
          document.removeEventListener('mouseup', this.onStopEvent);
          document.removeEventListener('touchmove', this.onMoveEvent);
          document.removeEventListener('touchend', this.onStopEvent);
          this.selectedTouch = null;
          // write new value
          this.calculateValue();
          // call did changed
          this.onChanged(this.slider.getAttribute(selectors$w.dataMinValue), this.slider.getAttribute(selectors$w.dataMaxValue));
      }
      onChange(min, max) {
          const rangeHolder = this.slider.closest(selectors$w.rangeHolder);
          if (rangeHolder) {
              const priceMin = rangeHolder.querySelector(selectors$w.priceMin);
              const priceMax = rangeHolder.querySelector(selectors$w.priceMax);
              if (priceMin && priceMax) {
                  priceMin.value = min;
                  priceMax.value = max;
              }
          }
      }
      onChanged(min, max) {
          if (this.slider.hasAttribute(selectors$w.dataFilterUpdate)) {
              this.slider.dispatchEvent(new CustomEvent('range:filter:update', {
                  bubbles: true
              }));
          }
      }
      calculateValue() {
          const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
          let minValue = this.lineSpan.offsetLeft / this.initialValue;
          let maxValue = minValue + newValue;
          minValue = minValue * (this.max - this.min) + this.min;
          maxValue = maxValue * (this.max - this.min) + this.min;
          if (this.step !== 0.0) {
              let multi = Math.floor(minValue / this.step);
              minValue = this.step * multi;
              multi = Math.floor(maxValue / this.step);
              maxValue = this.step * multi;
          }
          if (this.selectedTouch === this.touchLeft) {
              this.slider.setAttribute(selectors$w.dataMinValue, minValue);
          }
          if (this.selectedTouch === this.touchRight) {
              this.slider.setAttribute(selectors$w.dataMaxValue, maxValue);
          }
      }
      unload() {
          window.removeEventListener('resize', this.onResize);
          this.touchLeft.removeEventListener('mousedown', this.onStartEvent);
          this.touchRight.removeEventListener('mousedown', this.onStartEvent);
          this.touchLeft.removeEventListener('touchstart', this.onStartEvent);
          this.touchRight.removeEventListener('touchstart', this.onStartEvent);
      }
      constructor(section){
          this.container = section.container;
          this.slider = section.querySelector(selectors$w.rangeSlider);
          if (this.slider) {
              this.onMoveEvent = (event)=>this.onMove(event)
              ;
              this.onStopEvent = (event)=>this.onStop(event)
              ;
              this.onStartEvent = (event)=>this.onStart(event)
              ;
              this.onResize = ()=>this.setDefaultValues()
              ;
              this.startX = 0;
              this.x = 0;
              // retrieve touch button
              this.touchLeft = this.slider.querySelector(selectors$w.rangeDotLeft);
              this.touchRight = this.slider.querySelector(selectors$w.rangeDotRight);
              this.lineSpan = this.slider.querySelector(selectors$w.rangeLine);
              // get some properties
              this.min = parseFloat(this.slider.getAttribute(selectors$w.dataMin));
              this.max = parseFloat(this.slider.getAttribute(selectors$w.dataMax));
              this.step = 0.0;
              // normalize flag
              this.normalizeFact = 26;
              this.init();
              document.addEventListener('theme:reset-price-range', ()=>{
                  this.setDefaultValues();
              });
              window.addEventListener('resize', this.onResize);
          }
      }
  };

  const selectors$v = {
      wrapper: '[data-swapper-wrapper]',
      target: '[data-swapper-target]',
      input: '[data-swapper-input]',
      hover: 'data-swapper-hover'
  };
  let sections$f = {};
  let Swapper = class Swapper {
      init() {
          this.inputs.forEach((input)=>{
              input.addEventListener('change', (function() {
                  this.deafaultContent = input.getAttribute('value');
              }).bind(this));
          });
          this.hovers.forEach((hover)=>{
              hover.addEventListener('mouseenter', (function() {
                  const newContent = hover.getAttribute(selectors$v.hover);
                  this.target.innerHTML = `${newContent}`;
              }).bind(this));
              hover.addEventListener('mouseleave', (function() {
                  this.target.innerHTML = this.deafaultContent;
              }).bind(this));
          });
      }
      constructor(el){
          this.container = el;
          this.target = this.container.querySelector(selectors$v.target);
          this.inputs = this.container.querySelectorAll(selectors$v.input);
          this.hovers = this.container.querySelectorAll(`[${selectors$v.hover}]`);
          if (this.target && this.hovers.length) {
              this.deafaultContent = this.target.innerHTML;
              this.init();
          }
      }
  };
  function makeSwappers(instance) {
      sections$f[instance.id] = [];
      const els = instance.container.querySelectorAll(selectors$v.wrapper);
      els.forEach((el)=>{
          sections$f[instance.id].push(new Swapper(el));
      });
  }
  const swapperSection = {
      onLoad () {
          makeSwappers(this);
      }
  };

  const selectors$u = {
      form: '[data-sidebar-filter-form]',
      inputs: 'input, select, label, textarea',
      priceMin: '[data-field-price-min]',
      priceMax: '[data-field-price-max]',
      priceMinValue: 'data-field-price-min',
      priceMaxValue: 'data-field-price-max',
      rangeMin: '[data-se-min-value]',
      rangeMax: '[data-se-max-value]',
      rangeMinValue: 'data-se-min-value',
      rangeMaxValue: 'data-se-max-value',
      rangeMinDefault: 'data-se-min',
      rangeMaxDefault: 'data-se-max'
  };
  let FiltersForm = class FiltersForm {
      init() {
          // // Color swatches tooltips
          new Swapper(this.form);
          if (this.filtersInputs.length) {
              this.filtersInputs.forEach((el)=>{
                  el.addEventListener('input', debounce(()=>{
                      if (this.form && typeof this.form.submit === 'function') {
                          if (el.hasAttribute(selectors$u.priceMinValue) || el.hasAttribute(selectors$u.priceMaxValue)) {
                              const rangeMinDefault = parseInt(this.rangeMin.getAttribute(selectors$u.rangeMinDefault));
                              const rangeMaxDefault = parseInt(this.rangeMax.getAttribute(selectors$u.rangeMaxDefault));
                              if (this.priceMin.value && !this.priceMax.value) {
                                  this.priceMax.value = rangeMaxDefault;
                              }
                              if (this.priceMax.value && !this.priceMin.value) {
                                  this.priceMin.value = rangeMinDefault;
                              }
                              if (this.priceMin.value <= rangeMinDefault && this.priceMax.value >= rangeMaxDefault) {
                                  this.priceMin.placeholder = rangeMinDefault;
                                  this.priceMax.placeholder = rangeMaxDefault;
                                  this.priceMin.value = '';
                                  this.priceMax.value = '';
                              }
                          }
                          this.form.submit();
                      }
                  }, 500));
              });
          }
          this.form.addEventListener('range:filter:update', ()=>this.updateRange()
          );
      }
      updateRange() {
          if (this.form && typeof this.form.submit === 'function') {
              const checkElements = this.rangeMin && this.rangeMax && this.priceMin && this.priceMax;
              if (checkElements && this.rangeMin.hasAttribute(selectors$u.rangeMinValue) && this.rangeMax.hasAttribute(selectors$u.rangeMaxValue)) {
                  const priceMinValue = parseInt(this.priceMin.placeholder);
                  const priceMaxValue = parseInt(this.priceMax.placeholder);
                  const rangeMinValue = parseInt(this.rangeMin.getAttribute(selectors$u.rangeMinValue));
                  const rangeMaxValue = parseInt(this.rangeMax.getAttribute(selectors$u.rangeMaxValue));
                  if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
                      this.priceMin.value = rangeMinValue;
                      this.priceMax.value = rangeMaxValue;
                      this.priceMin.dispatchEvent(new CustomEvent('input', {
                          bubbles: true
                      }));
                      this.priceMax.dispatchEvent(new CustomEvent('input', {
                          bubbles: true
                      }));
                  }
              }
          }
      }
      constructor(section){
          this.form = section.container.querySelector(selectors$u.form);
          this.filtersInputs = [];
          if (this.form) {
              new RangeSlider(this.form);
              this.filtersInputs = this.form.querySelectorAll(selectors$u.inputs);
              this.priceMin = this.form.querySelector(selectors$u.priceMin);
              this.priceMax = this.form.querySelector(selectors$u.priceMax);
              this.rangeMin = this.form.querySelector(selectors$u.rangeMin);
              this.rangeMax = this.form.querySelector(selectors$u.rangeMax);
              this.init();
          }
      }
  };
  const collectionFiltersForm = {
      onLoad () {
          this.filterForm = new FiltersForm(this);
      },
      onUnload: function() {
          if (this.filterForm && typeof this.filterForm.unload === 'function') {
              this.filterForm.unload();
          }
      }
  };

  var selectors$t = {
      collectionSidebar: '[data-collection-sidebar]',
      collectionNavGrouped: '.collection-nav--grouped',
      collectionSidebarHeading: '.collection__sidebar__heading',
      linkAdd: '.link--add',
      linkRemove: '.link--remove'
  };
  let Collection = class Collection {
      init() {
          // Color swatches tooltips
          new Swapper(this.sidebar);
          this.removeUnusableFilters();
      }
      removeUnusableFilters() {
          const collectionNavGrouped = this.container.querySelectorAll(selectors$t.collectionNavGrouped);
          if (collectionNavGrouped.length > 0) {
              collectionNavGrouped.forEach((element)=>{
                  const linkAdd = element.querySelector(selectors$t.linkAdd);
                  const linkRemove = element.querySelector(selectors$t.linkRemove);
                  if (!linkAdd && !linkRemove) {
                      hideElement(element);
                      hideElement(element.parentElement.querySelector(selectors$t.collectionSidebarHeading));
                  }
              });
          }
      }
      constructor(section){
          this.container = section.container;
          this.sidebar = this.container.querySelector(selectors$t.collectionSidebar);
          this.init();
      }
  };
  const collectionSection = {
      onLoad () {
          this.collection = new Collection(this);
      }
  };
  register('collection', [
      collectionSection,
      sort,
      collectionFiltersSidebar,
      collectionFiltersForm,
      accordion
  ]);
  if (!customElements.get('popout-select')) {
      customElements.define('popout-select', PopoutSelect);
  }

  const selectors$s = {
      holderItems: '[data-custom-scrollbar-items]',
      scrollbar: '[data-custom-scrollbar]',
      scrollbarTrack: '[data-custom-scrollbar-track]'
  };
  const classes$d = {
      hide: 'hide'
  };
  const sections$e = {};
  let CustomScrollbar = class CustomScrollbar {
      events() {
          this.holderItems.addEventListener('scroll', this.calculatePosition.bind(this));
          document.addEventListener('theme:resize:width', this.calculateTrackWidth.bind(this));
          document.addEventListener('theme:resize:width', this.calculatePosition.bind(this));
      }
      calculateTrackWidth() {
          this.scrollbarWidth = this.scrollbar.clientWidth === 0 ? this.scrollbar.parentNode.getBoundingClientRect().width : this.scrollbar.clientWidth;
          setTimeout(()=>{
              this.scrollWidth = this.holderItems.children.length * (this.holderItems.children[0].clientWidth + Number(getComputedStyle(this.holderItems.children[0]).marginRight.replace('px', '')) + Number(getComputedStyle(this.holderItems.children[0]).marginLeft.replace('px', '')));
              this.trackWidth = this.scrollbarWidth / this.scrollWidth * 100;
              this.trackWidth = this.trackWidth < 5 ? 5 : this.trackWidth;
              this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}%`);
              const hideScrollbar = this.trackWidth >= 100;
              this.scrollbar.classList.toggle(classes$d.hide, hideScrollbar);
          }, 100);
      }
      calculatePosition() {
          let position = this.holderItems.scrollLeft / (this.holderItems.scrollWidth - this.holderItems.clientWidth);
          position *= this.scrollbar.clientWidth - this.scrollbarTrack.clientWidth;
          position = position < 0 ? 0 : position;
          position = isNaN(position) ? 0 : position;
          this.scrollbar.style.setProperty('--position', `${Math.round(position)}px`);
          document.dispatchEvent(new CustomEvent('theme:scrollbar:scroll', {
              bubbles: true,
              detail: {
                  holder: this.holderItems
              }
          }));
      }
      constructor(holder){
          this.holderItems = holder.querySelector(selectors$s.holderItems);
          this.scrollbar = holder.querySelector(selectors$s.scrollbar);
          this.scrollbarTrack = holder.querySelector(selectors$s.scrollbarTrack);
          this.trackWidth = 0;
          this.scrollWidth = 0;
          if (this.scrollbar && this.holderItems) {
              this.events();
              this.calculateTrackWidth();
          }
      }
  };
  const customScrollbar = {
      onLoad () {
          sections$e[this.id] = new CustomScrollbar(this.container);
      }
  };

  const selectors$r = {
      slider: 'data-slideshow',
      slide: 'data-slide',
      slideIndex: 'data-slide-index',
      prevArrow: '[data-prev-arrow]',
      nextArrow: '[data-next-arrow]',
      sliderActions: '[data-slider-actions]',
      flickitySlider: '.flickity-slider',
      flickityDisableClass: 'flickity-disabled-mobile',
      flickityEnabled: 'flickity-enabled',
      minimumAttribute: 'data-minimum'
  };
  const config$1 = {
      minimumVisibleSlidesDesktop: 4,
      minimumVisibleSlidesTablet: 2,
      minimumVisibleSlidesSmallMobile: 1
  };
  const classes$c = {
      hide: 'hide'
  };
  const sections$d = {};
  let DefaultSlider = class DefaultSlider {
      init() {
          this.flkty = new Flickity(this.slideshow, {
              cellAlign: 'left',
              groupCells: true,
              pageDots: false,
              contain: true,
              prevNextButtons: false,
              watchCSS: true
          });
          if (this.prevArrow) {
              this.prevArrow.addEventListener('click', (e)=>{
                  e.preventDefault();
                  this.flkty.previous();
              });
          }
          if (this.nextArrow) {
              this.nextArrow.addEventListener('click', (e)=>{
                  e.preventDefault();
                  this.flkty.next();
              });
          }
          this.flkty.on('change', ()=>this.setButtonStatus()
          );
          this.flkty.on('select', ()=>{
              this.flkty.options.draggable = true;
              this.flkty.updateDraggable();
          });
          this.showSliderActions();
          this.stopSlider();
          document.addEventListener('theme:resize', this.resizeEvent);
      }
      setButtonStatus(resize = false) {
          if (this.flkty && this.flkty.slides && this.nextArrow && this.prevArrow) {
              if (resize) {
                  this.flkty.reposition();
              }
              const selectedIndex = this.flkty.selectedIndex;
              if (selectedIndex == this.flkty.slides.length - 1) {
                  this.nextArrow.setAttribute('disabled', '');
              } else {
                  this.nextArrow.removeAttribute('disabled');
              }
              if (selectedIndex === 0) {
                  this.prevArrow.setAttribute('disabled', '');
              } else {
                  this.prevArrow.removeAttribute('disabled');
              }
          }
      }
      showSliderActions() {
          let hideSliderActions = true;
          if (this.flkty && this.flkty.cells && this.flkty.cells.length) {
              const showActionsForDesktop = this.flkty.cells.length > this.config.minimumVisibleSlidesDesktop && window.innerWidth >= window.theme.sizes.large;
              const showActionsForTablet = this.flkty.cells.length > this.config.minimumVisibleSlidesTablet && window.innerWidth < window.theme.sizes.large;
              const showActionsForSmallMobile = this.flkty.cells.length > this.config.minimumVisibleSlidesSmallMobile && window.innerWidth < window.theme.sizes.small;
              if (showActionsForDesktop || showActionsForTablet || showActionsForSmallMobile) {
                  hideSliderActions = false;
              }
          }
          if (this.sliderActions) {
              this.sliderActions.classList.toggle(classes$c.hide, hideSliderActions);
          }
      }
      stopSlider() {
          var ref;
          if (window.innerWidth < window.theme.sizes.medium && ((ref = this.slideshow) === null || ref === void 0 ? void 0 : ref.classList.contains(selectors$r.flickityDisableClass))) {
              new CustomScrollbar(this.container);
          }
      }
      resizeEvents() {
          this.setButtonStatus(true);
          this.showSliderActions();
          this.stopSlider();
      }
      unload() {
          document.removeEventListener('theme:resize', this.resizeEvent);
          if (this.flkty) {
              this.flkty.destroy();
          }
      }
      onBlockSelect(evt) {
          if (this.slideshow) {
              const currentSlide = this.slideshow.querySelector(`[${selectors$r.slide}="${evt.detail.blockId}"]`);
              if (currentSlide) {
                  const slideIndex = parseInt(currentSlide.getAttribute(selectors$r.slideIndex));
                  if (this.flkty && this.flkty.element && this.flkty.element.classList.contains(selectors$r.flickityEnabled)) {
                      this.flkty.selectCell(slideIndex);
                  }
              }
          }
      }
      constructor(container){
          this.container = container;
          this.slideshow = this.container.querySelector(`[${selectors$r.slider}]`);
          this.sliderActions = this.container.querySelector(selectors$r.sliderActions);
          this.prevArrow = this.container.querySelector(selectors$r.prevArrow);
          this.nextArrow = this.container.querySelector(selectors$r.nextArrow);
          this.flkty = null;
          this.resizeEvent = ()=>this.resizeEvents()
          ;
          if (this.slideshow) {
              config$1.minimumVisibleSlidesDesktop = Number(this.slideshow.getAttribute(selectors$r.slider)) ? Number(this.slideshow.getAttribute(selectors$r.slider)) : config$1.minimumVisibleSlidesDesktop;
              config$1.minimumVisibleSlidesDesktop = Number(this.container.getAttribute(selectors$r.minimumAttribute)) ? Number(this.container.getAttribute(selectors$r.minimumAttribute)) : config$1.minimumVisibleSlidesDesktop;
              this.config = {
                  ...config$1
              };
              this.init();
          } else {
              this.stopSlider(true);
          }
      }
  };
  const slider = {
      onLoad () {
          sections$d[this.id] = new DefaultSlider(this.container);
      },
      onBlockSelect (evt) {
          if (typeof sections$d[this.id].onBlockSelect === 'function') {
              sections$d[this.id].onBlockSelect(evt);
          }
      },
      onUnload () {
          if (typeof sections$d[this.id].unload === 'function') {
              sections$d[this.id].unload();
          }
      }
  };

  register('section-collection', slider);

  function getScript(url, callback, callbackError) {
      let head = document.getElementsByTagName('head')[0];
      let done = false;
      let script = document.createElement('script');
      script.src = url;
      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function() {
          if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
              done = true;
              callback();
          } else {
              callbackError();
          }
      };
      head.appendChild(script);
  }

  const loaders$1 = {};
  window.isYoutubeAPILoaded = false;
  function loadScript$1(options = {}) {
      if (!options.type) {
          options.type = 'json';
      }
      if (options.url) {
          if (loaders$1[options.url]) {
              return loaders$1[options.url];
          } else {
              return getScriptWithPromise$1(options.url, options.type);
          }
      } else if (options.json) {
          if (loaders$1[options.json]) {
              return Promise.resolve(loaders$1[options.json]);
          } else {
              return window.fetch(options.json).then((response)=>{
                  return response.json();
              }).then((response)=>{
                  loaders$1[options.json] = response;
                  return response;
              });
          }
      } else if (options.name) {
          const key = ''.concat(options.name, options.version);
          if (loaders$1[key]) {
              return loaders$1[key];
          } else {
              return loadShopifyWithPromise$1(options);
          }
      } else {
          return Promise.reject();
      }
  }function getScriptWithPromise$1(url, type) {
      const loader = new Promise((resolve, reject)=>{
          if (type === 'text') {
              fetch(url).then((response)=>response.text()
              ).then((data)=>{
                  resolve(data);
              }).catch((error)=>{
                  reject(error);
              });
          } else {
              getScript(url, function() {
                  resolve();
              }, function() {
                  reject();
              });
          }
      });
      loaders$1[url] = loader;
      return loader;
  }
  function loadShopifyWithPromise$1(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject)=>{
          try {
              window.Shopify.loadFeatures([
                  {
                      name: options.name,
                      version: options.version,
                      onLoad: (err)=>{
                          onLoadFromShopify$1(resolve, reject, err);
                      }
                  }, 
              ]);
          } catch (err) {
              reject(err);
          }
      });
      loaders$1[key] = loader;
      return loader;
  }
  function onLoadFromShopify$1(resolve, reject, err) {
      if (err) {
          return reject(err);
      } else {
          return resolve();
      }
  }

  var touched = false;
  function isTouch() {
      return touched;
  }function wasTouched() {
      touched = true;
      document.removeEventListener('touchstart', wasTouched, {
          passive: true
      });
      document.querySelector('body').classList.add('supports-touch');
      document.dispatchEvent(new CustomEvent('theme:touch', {
          bubbles: true
      }));
  }
  document.addEventListener('touchstart', wasTouched, {
      passive: true
  });

  const defaultOptions$1 = {
      cc_load_policy: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      controls: 1,
      showinfo: 0,
      ecver: 2,
      fs: 1,
      rel: 0
  };
  function embedYoutube(uniqueKey, options) {
      const playerOptions = {
          ...defaultOptions$1,
          ...options
      };
      const playerWrapper = document.querySelector(`[data-player="${uniqueKey}"]`);
      const playerElement = playerWrapper.querySelector('iframe, [data-replace]');
      const youtubeKey = playerWrapper.querySelector('[data-video-id]').getAttribute('data-video-id');
      if (!window.isYoutubeAPILoaded) {
          loadScript$1({
              url: 'https://www.youtube.com/iframe_api'
          });
          window.isYoutubeAPILoaded = true;
      }
      const playerPromise = window.youtubeLoaderPromise.then(function() {
          let player = new window.YT.Player(playerElement, {
              videoId: youtubeKey,
              playerVars: {
                  ...playerOptions
              }
          });
          playerWrapper.addEventListener('pause', function() {
              try {
                  if (player.pauseVideo) {
                      player.pauseVideo();
                  }
              } catch (e) {
                  console.warn(e);
              }
          });
          playerWrapper.addEventListener('play-desktop', function() {
              if (!isTouch()) {
                  playerWrapper.dispatchEvent(new Event('play'));
              }
          });
          playerWrapper.addEventListener('play', function() {
              try {
                  if (player.playVideo) {
                      player.playVideo();
                  } else {
                      player.addEventListener('onReady', function(event) {
                          event.target.playVideo();
                      });
                  }
              } catch (e) {
                  console.warn(e);
              }
          });
          playerWrapper.addEventListener('destroy', function() {
              try {
                  if (player.destroy) {
                      player.destroy();
                  }
              } catch (e) {
                  console.warn(e);
              }
          });
          return player;
      }).catch(function(err) {
          console.error(err);
      });
      return playerPromise;
  }window.youtubeLoaderPromise = new Promise((resolve)=>{
      window.onYouTubeIframeAPIReady = function() {
          resolve();
      };
  });

  const defaultOptions = {
      autoplay: true,
      loop: true,
      controls: true,
      muted: false,
      playsinline: true
  };
  function embedVimeo(uniqueKey, options) {
      const playerOptions = {
          ...defaultOptions,
          ...options
      };
      const playerWrapper = document.querySelector(`[data-player="${uniqueKey}"]`);
      const playerElement = playerWrapper.querySelector('iframe, [data-replace]');
      const vimeoKey = playerWrapper.querySelector('[data-video-id]').getAttribute('data-video-id');
      const loadedPromise = loadScript$1({
          url: 'https://player.vimeo.com/api/player.js'
      });
      const vimeoSelector = `select-${uniqueKey}`;
      playerElement.setAttribute('id', vimeoSelector);
      const returnPlayer = loadedPromise.then(function() {
          const player = new window.Vimeo.Player(vimeoSelector, {
              ...playerOptions,
              id: vimeoKey
          });
          playerWrapper.addEventListener('pause', function() {
              try {
                  if (player.pause) {
                      player.pause();
                  }
              } catch (e) {
                  console.warn(e);
              }
          });
          playerWrapper.addEventListener('play-desktop', function() {
              if (!isTouch()) {
                  playerWrapper.dispatchEvent(new Event('play'));
              }
          });
          playerWrapper.addEventListener('play', function() {
              if (player.play) {
                  player.play();
              }
          });
          playerWrapper.addEventListener('destroy', function() {
              try {
                  if (player.destroy) {
                      player.destroy();
                  }
              } catch (e) {
                  console.log(e);
              }
          });
          return player;
      }).catch(function(err) {
          console.error(err);
      });
      return returnPlayer;
  }

  const selectors$q = {
      videoPopup: '[data-video-button]',
      backgroundVideo: '[data-background-video]',
      attrUnique: 'data-unique',
      attrVideoId: 'data-video-id',
      attrVideoType: 'data-video-type',
      attrPlayer: 'data-player'
  };
  let PopupVideo = class PopupVideo {
      init() {
          this.triggers.forEach((trigger)=>{
              const unique = trigger.getAttribute(selectors$q.attrUnique);
              const video = trigger.getAttribute(selectors$q.attrVideoId);
              const type = trigger.getAttribute(selectors$q.attrVideoType);
              // Find the modal body, which has been moved to the document root
              // and append a unique ID for youtube and vimeo to init players.
              const uniqueKey = `${video}-${unique}`;
              const player = document.querySelector(`[${selectors$q.attrPlayer}="${uniqueKey}"]`);
              // Modal Event Logic:
              // When a modal opens it creates and plays the video
              // When a modal opens it pauses background videos in this section
              // --
              // When a modal closes it destroys the player
              // When a modal closes it plays background videos anywhere on the page
              MicroModal.init({
                  onShow: ()=>{
                      if (this.backgroundVideo && typeof this.backgroundVideo.pause === 'function') {
                          this.backgroundVideo.pause();
                      }
                      let playerPromise = {};
                      if (type === 'youtube') {
                          playerPromise = embedYoutube(uniqueKey);
                      } else if (type === 'vimeo') {
                          playerPromise = embedVimeo(uniqueKey);
                      }
                      playerPromise.then(()=>{
                          player.dispatchEvent(new CustomEvent('play'));
                      });
                  },
                  onClose: (modal, el, event)=>{
                      event.preventDefault();
                      player.dispatchEvent(new CustomEvent('destroy'));
                      if (this.backgroundVideo && typeof this.backgroundVideo.play === 'function') {
                          this.backgroundVideo.play();
                      }
                  },
                  openTrigger: `data-trigger-${video}-${unique}`
              });
          });
      }
      constructor(section){
          this.container = section.container;
          this.triggers = this.container.querySelectorAll(selectors$q.videoPopup);
          this.backgroundVideo = this.container.querySelector(selectors$q.backgroundVideo);
          this.init();
      }
  };
  const popupVideoSection = {
      onLoad () {
          new PopupVideo(this);
      }
  };

  register('section-custom-content', [
      slider,
      popupVideoSection
  ]);

  var sections$c = {};
  const parallaxImage = {
      onLoad () {
          sections$c[this.id] = [];
          const frames = this.container.querySelectorAll('[data-parallax-wrapper]');
          frames.forEach((frame)=>{
              const inner = frame.querySelector('[data-parallax-img]');
              sections$c[this.id].push(new Rellax(inner, {
                  center: true,
                  round: true,
                  frame: frame
              }));
          });
      },
      onUnload: function() {
          sections$c[this.id].forEach((image)=>{
              if (typeof image.destroy === 'function') {
                  image.destroy();
              }
          });
      }
  };

  const selectors$p = {
      scrollElement: '[data-block-scroll]',
      flickityEnabled: 'flickity-enabled'
  };
  const sections$b = {};
  let BlockScroll = class BlockScroll {
      onBlockSelect(evt) {
          const scrollElement = this.container.querySelector(selectors$p.scrollElement);
          if (scrollElement && !scrollElement.classList.contains(selectors$p.flickityEnabled)) {
              const currentElement = evt.srcElement;
              if (currentElement) {
                  scrollElement.scrollTo({
                      top: 0,
                      left: currentElement.offsetLeft,
                      behavior: 'smooth'
                  });
              }
          }
      }
      constructor(el){
          this.container = el.container;
      }
  };
  const blockScroll = {
      onLoad () {
          sections$b[this.id] = new BlockScroll(this);
      },
      onBlockSelect (e) {
          sections$b[this.id].onBlockSelect(e);
      }
  };

  const sections$a = {};
  const selectors$o = {
      slideshow: '[data-section-timeline-slideshow]',
      firstText: '[data-timeline-text-height]',
      overlay: '[data-has-image]',
      flickityDisableClass: 'flickity-disabled-mobile',
      flickityEnabled: 'flickity-enabled'
  };
  let IndexTimeline = class IndexTimeline {
      init() {
          this.flkty = new Flickity(this.slides, {
              cellAlign: 'left',
              adaptiveHeight: false,
              groupCells: true,
              pageDots: false,
              contain: true,
              watchCSS: true
          });
          this.flkty.on('select', ()=>{
              this.flkty.options.draggable = true;
              this.flkty.updateDraggable();
          });
          this.stopSlider();
          document.addEventListener('theme:resize', ()=>{
              this.stopSlider();
          });
      }
      stopSlider() {
          var ref;
          if (window.innerWidth < window.theme.sizes.medium && ((ref = this.slides) === null || ref === void 0 ? void 0 : ref.classList.contains(selectors$o.flickityDisableClass))) {
              new CustomScrollbar(this.container);
          }
      }
      onBlockSelect(evt) {
          const indexEl = evt.target.closest('[data-slideshow-index]');
          const slideIndex = indexEl.getAttribute('data-slideshow-index');
          const select = parseInt(slideIndex, 10);
          if (this.flkty && this.flkty.element && this.flkty.element.classList.contains(selectors$o.flickityEnabled)) {
              this.flkty.selectCell(select);
              this.flkty.pausePlayer();
          }
      }
      unload() {
          if (this.flickity) {
              this.flkty.destroy();
          }
      }
      constructor(section){
          this.section = section;
          this.container = section.container;
          this.slides = this.container.querySelector(selectors$o.slideshow);
          this.firstText = this.container.querySelector(selectors$o.firstText);
          this.overlay = this.container.querySelector(selectors$o.overlay);
          if (this.overlay && this.firstText) {
              const upper = `-${this.firstText.clientHeight}px`;
              this.container.style.setProperty('--timeshow-offset', upper);
          }
          this.init();
      }
  };
  const timelineSection = {
      onLoad () {
          sections$a[this.id] = new IndexTimeline(this);
      },
      onUnload () {
          if (typeof sections$a[this.id].unload === 'function') {
              sections$a[this.id].unload();
          }
      },
      onBlockSelect (evt) {
          if (typeof sections$a[this.id].onBlockSelect === 'function') {
              sections$a[this.id].onBlockSelect(evt);
          }
      }
  };
  register('section-timeline', [
      timelineSection,
      parallaxImage,
      blockScroll
  ]);

  const footerSection = {
      onLoad () {
          // Lighthouse fires security warning for the Shopify link.
          var shopifyLink = document.querySelector('[data-powered-link] a');
          if (shopifyLink) {
              shopifyLink.setAttribute('rel', 'noopener');
          }
      }
  };
  register('footer', [
      footerSection
  ]);
  if (!customElements.get('popout-select')) {
      customElements.define('popout-select', PopoutSelect);
  }

  const tokensReducer = (acc, token)=>{
      const { el , elStyle , elHeight , rowsLimit , rowsWrapped , options  } = acc;
      let oldBuffer = acc.buffer;
      let newBuffer = oldBuffer;
      if (rowsWrapped === rowsLimit + 1) {
          return {
              ...acc
          };
      }
      const textBeforeWrap = oldBuffer;
      let newRowsWrapped = rowsWrapped;
      let newHeight = elHeight;
      el.innerHTML = newBuffer = oldBuffer.length ? `${oldBuffer}${options.delimiter}${token}${options.replaceStr}` : `${token}${options.replaceStr}`;
      if (parseFloat(elStyle.height) > parseFloat(elHeight)) {
          newRowsWrapped++;
          newHeight = elStyle.height;
          if (newRowsWrapped === rowsLimit + 1) {
              el.innerHTML = newBuffer = textBeforeWrap[textBeforeWrap.length - 1] === '.' && options.replaceStr === '...' ? `${textBeforeWrap}..` : `${textBeforeWrap}${options.replaceStr}`;
              return {
                  ...acc,
                  elHeight: newHeight,
                  rowsWrapped: newRowsWrapped
              };
          }
      }
      el.innerHTML = newBuffer = textBeforeWrap.length ? `${textBeforeWrap}${options.delimiter}${token}` : `${token}`;
      return {
          ...acc,
          buffer: newBuffer,
          elHeight: newHeight,
          rowsWrapped: newRowsWrapped
      };
  };
  const ellipsis = (selector = '', rows = 1, options = {})=>{
      const defaultOptions = {
          replaceStr: '...',
          debounceDelay: 250,
          delimiter: ' '
      };
      const opts = {
          ...defaultOptions,
          ...options
      };
      const elements = selector && (selector instanceof NodeList ? selector : selector.nodeType === 1 // if node type is Node.ELEMENT_NODE
       ? [
          selector
      ] // wrap it in (NodeList) if it is a single node
       : document.querySelectorAll(selector));
      for(let i = 0; i < elements.length; i++){
          const el = elements[i];
          const elementHtml = el.innerHTML;
          const commentRegex = /<!--[\s\S]*?-->/g;
          const htmlWithoutComments = elementHtml.replace(commentRegex, '');
          const splittedText = htmlWithoutComments.split(opts.delimiter);
          el.innerHTML = '';
          const elStyle = window.getComputedStyle(el);
          splittedText.reduce(tokensReducer, {
              el,
              buffer: el.innerHTML,
              elStyle,
              elHeight: 0,
              rowsLimit: rows,
              rowsWrapped: 0,
              options: opts
          });
      }
  };

  const selectors$n = {
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
  };
  function modal(unique) {
      const uniqueID = `data-popup-${unique}`;
      MicroModal.init({
          openTrigger: uniqueID,
          disableScroll: true,
          onShow: (modal1, el, event)=>{
              event.preventDefault();
              const firstFocus = modal1.querySelector(selectors$n.focusable);
              trapFocus(modal1, {
                  elementToFocus: firstFocus
              });
          },
          onClose: (modal, el, event)=>{
              event.preventDefault();
              removeTrapFocus();
              el.focus();
          }
      });
  }

  var modelJsonSections = {};
  var models = {};
  var xrButtons = {};
  const selectors$m = {
      productMediaWrapper: '[data-product-single-media-wrapper]',
      productSlideshow: '[data-product-slideshow]',
      productScrollbar: 'data-custom-scrollbar-items',
      productXr: '[data-shopify-xr]',
      dataMediaId: 'data-media-id',
      dataModelId: 'data-model-id',
      modelViewer: 'model-viewer',
      dataModel3d: 'data-shopify-model3d-id',
      modelJson: '#ModelJson-'
  };
  function initSectionModels(modelViewerContainer, sectionId) {
      modelJsonSections[sectionId] = {
          loaded: false
      };
      const mediaId = modelViewerContainer.getAttribute(selectors$m.dataMediaId);
      const modelViewerElement = modelViewerContainer.querySelector(selectors$m.modelViewer);
      const modelId = modelViewerElement.getAttribute(selectors$m.dataModelId);
      const xrButton = modelViewerContainer.closest(selectors$m.productSlideshow).parentElement.querySelector(selectors$m.productXr);
      xrButtons[sectionId] = {
          $element: xrButton,
          defaultId: modelId
      };
      models[mediaId] = {
          modelId: modelId,
          mediaId: mediaId,
          sectionId: sectionId,
          $container: modelViewerContainer,
          $element: modelViewerElement
      };
      window.Shopify.loadFeatures([
          {
              name: 'shopify-xr',
              version: '1.0',
              onLoad: setupShopifyXr
          },
          {
              name: 'model-viewer-ui',
              version: '1.0',
              onLoad: setupModelViewerUi
          }, 
      ]);
  }function setupShopifyXr(errors) {
      if (errors) {
          console.warn(errors);
          return;
      }
      if (!window.ShopifyXR) {
          document.addEventListener('shopify_xr_initialized', function() {
              setupShopifyXr();
          });
          return;
      }
      for(const sectionId in modelJsonSections){
          if (modelJsonSections.hasOwnProperty(sectionId)) {
              const modelSection = modelJsonSections[sectionId];
              if (modelSection.loaded) continue;
              const modelJson = document.querySelector(`${selectors$m.modelJson}${sectionId}`);
              if (modelJson) {
                  window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
                  modelSection.loaded = true;
              }
          }
      }
      window.ShopifyXR.setupXRElements();
  }
  function setupModelViewerUi(errors) {
      if (errors) {
          console.warn(errors);
          return;
      }
      for(const key in models){
          if (models.hasOwnProperty(key)) {
              const model = models[key];
              if (!model.modelViewerUi) {
                  model.modelViewerUi = new Shopify.ModelViewerUI(model.$element);
              }
              setupModelViewerListeners(model);
          }
      }
  }
  function observeModel(model) {
      const xrButton = xrButtons[model.sectionId];
      const observer = new IntersectionObserver((entries, observer)=>{
          entries.forEach((entry)=>{
              const insideOfViewport = entry.intersectionRatio > 0.5;
              if (entry.target.hasAttribute(selectors$m.dataMediaId) && insideOfViewport) {
                  xrButton.$element.setAttribute(selectors$m.dataModel3d, entry.target.getAttribute(selectors$m.dataMediaId));
              }
          });
      }, {
          threshold: 1
      });
      observer.observe(model.$container);
  }
  function setupModelViewerListeners(model) {
      const xrButton = xrButtons[model.sectionId];
      model.$container.addEventListener('pause', function() {
          if (model.modelViewerUi.pause) {
              model.modelViewerUi.pause();
          }
      });
      model.$container.addEventListener('play-desktop', function() {
          if (model.modelViewerUi.play && !isTouch()) {
              model.modelViewerUi.play();
          }
          if (xrButton && xrButton.$element && model && model.modelId && selectors$m.dataModel3d) {
              xrButton.$element.setAttribute(selectors$m.dataModel3d, model.modelId);
          }
      });
      model.$container.addEventListener('play', function() {
          if (model.modelViewerUi.play) {
              model.modelViewerUi.play();
          }
      });
      model.$container.addEventListener('click', function() {
          if (xrButton && xrButton.$element && model && model.modelId && selectors$m.dataModel3d) {
              xrButton.$element.setAttribute(selectors$m.dataModel3d, model.modelId);
          }
      });
      document.addEventListener('theme:scrollbar:scroll', function(event) {
          if (event.detail.holder === model.$container.parentElement) {
              observeModel(model);
          }
      });
  }

  async function productNativeVideo(uniqueKey) {
      const playerElement = document.querySelector(`[data-player="${uniqueKey}"]`);
      const videoElement = playerElement.querySelector('video');
      const videoLoad = {
          name: 'video-ui',
          version: '1.0'
      };
      await loadScript$1(videoLoad);
      const player = new window.Shopify.Plyr(videoElement);
      playerElement.addEventListener('pause', function() {
          if (player.pause) {
              player.pause();
          }
      });
      playerElement.addEventListener('play-desktop', function() {
          if (player.play && !isTouch()) {
              playerElement.dispatchEvent(new CustomEvent('play'));
          }
      });
      playerElement.addEventListener('play', function() {
          try {
              if (player.play) {
                  player.play();
              } else {
                  player.addEventListener('onReady', function(event) {
                      event.target.play();
                  });
              }
          } catch (e) {
              console.warn(e);
          }
      });
      playerElement.addEventListener('destroy', function() {
          try {
              if (player.destroy) {
                  player.destroy();
              }
          } catch (e) {
              console.warn(e);
          }
      });
      return player;
  }

  var selectors$l = {
      productSlideshow: '[data-product-slideshow]',
      productThumbs: '[data-product-thumbs]'
      productImage: '[data-product-image]',
      mediaSlide: '[data-media-slide]',
      dataMediaId: 'data-media-id',
      mediaType: 'data-type',
      videoPlayerNative: '[data-type="video"]',
      modelViewer: '[data-type="model"]',
      allPlayers: '[data-player]',
      xrButton: '[data-shopify-xr]',
      xrButtonId: 'data-shopify-model3d-id',
      loopVideo: 'data-enable-video-looping',
      videoYT: '[data-video-youtube]',
      videoVimeo: '[data-video-vimeo]',
      flickitylockHeight: 'flickity-lock-height',
      alignment: 'data-thumbs-align',
      flickityDisableClass: 'flickity-disabled-mobile'
  };
  let Media = class Media {
      init() {
          this.createSlider();
          this.detectVideo();
          this.detectVimeo();
          this.detect3d();
          this.stopSlider();
          document.addEventListener('theme:resize', ()=>{
              this.stopSlider();
          });
      }
      createSlider() {
          if (!this.slideshow) {
              return;
          }
          const instance = this;
          let flickityOptions = {
              autoPlay: false,
              prevNextButtons: false,
              contain: true,
              pageDots: false,
              adaptiveHeight: true,
              accessibility: true,
              wrapAround: true,
              fade: true,
              verticalCells: true,
              watchCSS: true,
              on: {
                  ready: function() {
                      instance.sliderThumbs();
                  }
              }
          };
          this.flkty = new FlickityFade(this.slideshow, flickityOptions);
          this.flkty.resize();
          this.currentSlide = this.slideshow.querySelectorAll(selectors$l.mediaSlide)[0];
          this.setDraggable();
          this.verticalCells();
          this.flkty.on('change', (function(index) {
              this.currentSlide.dispatchEvent(new CustomEvent('pause'));
              this.currentSlide = this.flkty.cells[index].element;
              this.slideshow.classList.remove(selectors$l.flickitylockHeight);
          }).bind(this));
          this.flkty.on('settle', (function(index) {
              this.currentSlide = this.flkty.cells[index].element;
              const videoYT = this.currentSlide.querySelector(selectors$l.videoYT);
              if (videoYT && !this.currentSlide.querySelector('iframe')) {
                  videoYT.dispatchEvent(new Event('click'));
              }
              this.setDraggable();
              this.currentSlide.dispatchEvent(new CustomEvent('play-desktop'));
              const isFocusEnabled = document.body.classList.contains(selectors$l.focusEnabled);
              if (isFocusEnabled) this.currentSlide.dispatchEvent(new Event('focus'));
              this.confirmSync();
          }).bind(this));
          this.eventListeners();
      }
      stopSlider() {
          var ref;
          if (window.innerWidth < window.theme.sizes.medium && ((ref = this.slideshow) === null || ref === void 0 ? void 0 : ref.classList.contains(selectors$l.flickityDisableClass))) {
              new CustomScrollbar(this.container);
          }
      }
      eventListeners() {
          this.slideshow.addEventListener('theme:image:change', (function(event) {
              var mediaId = event.detail.id;
              const mediaIdString = `[${selectors$l.dataMediaId}="${mediaId}"]`;
              if (window.innerWidth >= window.theme.sizes.medium) {
                  const matchesMedia = (cell)=>{
                      return cell.element.matches(mediaIdString);
                  };
                  const index = this.flkty.cells.findIndex(matchesMedia);
                  this.flkty.select(index);
              } else {
                  const currentCell = this.slideshow.querySelector(mediaIdString);
                  this.slideshow.scrollTo({
                      left: currentCell.offsetLeft,
                      behavior: 'smooth'
                  });
              }
          }).bind(this));
          this.thumbImages.forEach((thumb)=>{
              thumb.addEventListener('click', (function(event) {
                  const id = event.currentTarget.getAttribute('data-media-select');
                  this.slideshow.dispatchEvent(new CustomEvent('theme:image:change', {
                      detail: {
                          id: id
                      }
                  }));
              }).bind(this));
          });
      }
      sliderThumbs() {
          let opts = {
              freeScroll: true,
              contain: true,
              prevNextButtons: false,
              pageDots: false,
              accessibility: true,
              watchCSS: true,
              verticalCells: true,
              cellAlign: this.centerAlign ? 'center' : 'left',
              sync: this.slideshow
          };
          this.flktyThumbs = new FlickitySync(this.thumbWrapper, opts);
      }
      confirmSync() {
          if (this.flkty.selectedIndex !== this.flktyThumbs.selectedIndex) {
              this.flkty.resize();
          }
      }
      setDraggable() {
          if (this.currentSlide) {
              const mediaType = this.currentSlide.getAttribute(selectors$l.mediaType);
              if (mediaType === 'model' || mediaType === 'video' || mediaType === 'external_video') {
                  // fisrt boolean sets value, second option false to prevent refresh
                  this.flkty.options.draggable = false;
                  this.flkty.updateDraggable();
              } else {
                  this.flkty.options.draggable = true;
                  this.flkty.updateDraggable();
              }
          }
      }
      detect3d() {
          const modelViewerElements = this.container.querySelectorAll(selectors$l.modelViewer);
          if (modelViewerElements) {
              modelViewerElements.forEach((element)=>{
                  initSectionModels(element, this.section.id);
              });
              document.addEventListener('shopify_xr_launch', (function() {
                  this.container.querySelectorAll(selectors$l.allPlayers).forEach((player)=>{
                      player.dispatchEvent(new CustomEvent('pause'));
                  });
              }).bind(this));
          }
      }
      detectVideo() {
          const playerElements = this.section.container.querySelectorAll(selectors$l.videoPlayerNative);
          for (var player of playerElements){
              const uniqueKey = player.dataset.player;
              const nativePlayerPromise = productNativeVideo(uniqueKey);
              if (this.loopVideo === true) {
                  nativePlayerPromise.then((nativePlayer)=>{
                      nativePlayer.loop = true;
                      return nativePlayer;
                  }).catch((err)=>{
                      console.error(err);
                  });
              }
          }
      }
      detectVimeo() {
          const playerElements = this.section.container.querySelectorAll(selectors$l.videoVimeo);
          if (playerElements.length) {
              for (const player of playerElements){
                  const uniqueKey = player.dataset.player;
                  const vimeoPlayerPromise = embedVimeo(uniqueKey, {
                      loop: this.loopVideo
                  });
                  if (this.loopVideo) {
                      vimeoPlayerPromise.then((vimeoPlayer)=>{
                          return vimeoPlayer.setLoop(true);
                      }).catch((err)=>{
                          console.error(err);
                      });
                  }
              }
          }
      }
      pauseAllMedia() {
          const all = this.container.querySelector(`[data-media-slide]`);
          all.dispatchEvent(new CustomEvent('pause'));
      }
      pauseOtherMedia(uniqueKey) {
          const otherMedia = this.container.querySelector(`[data-media-slide]:not([data-player="${uniqueKey}"])`);
          otherMedia.dispatchEvent(new CustomEvent('pause'));
      }
      destroy() {
          this.container.querySelectorAll(selectors$l.allPlayers).forEach((player)=>{
              player.dispatchEvent(new CustomEvent('destroy'));
          });
      }
      constructor(section){
          this.section = section;
          this.container = section.container;
          this.slideshow = this.container.querySelector(selectors$l.productSlideshow);
          this.thumbWrapper = this.container.querySelector(selectors$l.productThumbs);
          this.thumbImages = this.container.querySelectorAll(selectors$l.thumbImage);
          this.loopVideo = this.container.getAttribute(selectors$l.loopVideo) === 'true';
          this.centerAlign = this.container.getAttribute(selectors$l.alignment) === 'center';
          this.flkty = null;
          this.flktyThumbs = null;
          this.currentSlide = null;
          this.init();
      }
  };

  const defaults = {
      color: 'ash'
  };
  const selectors$k = {
      swatch: 'data-swatch',
      variant: 'data-swatch-variant',
      link: '[data-grid-link]',
      swatchWrapper: '[data-swatch-wrapper]',
      target: '[data-swatch-target]'
  };
  let ColorMatch = class ColorMatch {
      getColor() {
          return this.match;
      }
      init() {
          const getColors = loadScript$1({
              json: window.theme.assets.swatches
          });
          return getColors.then((colors)=>{
              return this.matchColors(colors, this.settings.color);
          }).catch((e)=>{
              console.log('failed to load swatch colors script');
              console.log(e);
          });
      }
      matchColors(colors, name) {
          let bg = '#E5E5E5';
          let img = null;
          const path = window.theme.assets.base || '/';
          const comparisonName = name.toLowerCase().replace(/\s/g, '');
          const array = colors.colors;
          if (array) {
              const variantNameMatch = (nameObject)=>{
                  const indexName = Object.keys(nameObject).toString();
                  const neatName = indexName.toLowerCase().replace(/\s/g, '');
                  return neatName === comparisonName;
              };
              const position = array.findIndex(variantNameMatch);
              if (position > -1) {
                  const normalValue = Object.values(array[position])[0];
                  const value = normalValue.toLowerCase();
                  if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
                      img = `${path}${normalValue}`;
                      bg = '#888888';
                  } else {
                      bg = normalValue;
                  }
              }
          }
          return {
              color: this.settings.color,
              path: img,
              hex: bg
          };
      }
      constructor(options = {}){
          this.settings = {
              ...defaults,
              ...options
          };
          this.match = this.init();
      }
  };
  let RadioSwatch = class RadioSwatch extends HTMLElement {
      init() {
          this.setStyles();
      }
      setStyles() {
          if (this.colorMatch.hex) {
              this.element.style.setProperty('--swatch', `${this.colorMatch.hex}`);
          }
          if (this.colorMatch.path) {
              this.element.style.setProperty('background-image', `url(${this.colorMatch.path})`);
              this.element.style.setProperty('background-size', 'cover');
          }
      }
      constructor(){
          super();
          this.element = this.querySelector(`[${selectors$k.swatch}]`);
          this.colorString = this.element.getAttribute(selectors$k.swatch);
          const matcher = new ColorMatch({
              color: this.colorString
          });
          matcher.getColor().then((result)=>{
              this.colorMatch = result;
              this.init();
          });
      }
  };

  const selectors$j = {
      pickupContainer: 'data-store-availability-container',
      shopifySection: '[data-api-content]',
      drawer: '[data-pickup-drawer]',
      drawerOpen: '[data-pickup-drawer-open]',
      drawerClose: '[data-pickup-drawer-close]',
      drawerBody: '[data-pickup-body]'
  };
  const classes$b = {
      isVisible: 'drawer--visible',
      isHidden: 'hide'
  };
  let sections$9 = {};
  let PickupAvailability = class PickupAvailability {
      fetchPickupAvailability(event) {
          const container = this.container.querySelector(`[${selectors$j.pickupContainer}]`);
          if (!container) {
              return;
          }
          let variantID = null;
          if (event) {
              if (event.detail.variant !== null) {
                  variantID = event.detail.variant.id;
              } else {
                  // If variant missing
                  container.classList.add(classes$b.isHidden);
              }
          } else {
              variantID = container.getAttribute(selectors$j.pickupContainer);
          }
          if (variantID) {
              container.classList.remove(classes$b.isHidden);
              fetch(`${window.theme.routes.root_url}variants/${variantID}/?section_id=api-pickup-availability`).then(this.handleErrors).then((response)=>response.text()
              ).then((text)=>{
                  const pickupAvailabilityHTML = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$j.shopifySection).innerHTML;
                  container.innerHTML = pickupAvailabilityHTML;
                  container.classList.toggle(classes$b.isHidden, pickupAvailabilityHTML.trim().length === 0);
                  this.drawer = this.container.querySelector(selectors$j.drawer);
                  this.buttonDrawerOpen = this.container.querySelector(selectors$j.drawerOpen);
                  this.buttonDrawerClose = this.container.querySelectorAll(selectors$j.drawerClose);
                  this.drawerBody = this.container.querySelector(selectors$j.drawerBody);
                  if (this.buttonDrawerOpen) {
                      this.buttonDrawerOpen.addEventListener('click', ()=>this.openDrawer()
                      );
                  }
                  if (this.buttonDrawerClose.length) {
                      this.buttonDrawerClose.forEach((element)=>{
                          element.addEventListener('click', ()=>this.closeDrawer()
                          );
                      });
                  }
              }).catch((e)=>{
                  console.error(e);
              });
          }
      }
      openDrawer() {
          if (this.drawer) {
              this.drawer.classList.add(classes$b.isVisible);
              this.drawerBody.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                  bubbles: true
              }));
          }
      }
      closeDrawer() {
          if (this.drawer) {
              this.drawer.classList.remove(classes$b.isVisible);
              this.drawerBody.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                  bubbles: true
              }));
          }
      }
      handleErrors(response) {
          if (!response.ok) {
              return response.json().then(function(json) {
                  const e = new FetchError({
                      status: response.statusText,
                      headers: response.headers,
                      json: json
                  });
                  throw e;
              });
          }
          return response;
      }
      constructor(section){
          this.container = section.container;
          this.drawer = null;
          this.buttonDrawerOpen = null;
          this.buttonDrawerClose = null;
          this.drawerBody = null;
          this.fetchPickupAvailability();
          this.container.addEventListener('theme:variant:change', (event)=>this.fetchPickupAvailability(event)
          );
      }
  };
  const pickupAvailability = {
      onLoad () {
          sections$9[this.id] = new PickupAvailability(this);
      }
  };

  function Listeners() {
      this.entries = [];
  }Listeners.prototype.add = function(element, event, fn) {
      this.entries.push({
          element: element,
          event: event,
          fn: fn
      });
      element.addEventListener(event, fn);
  };
  Listeners.prototype.removeAll = function() {
      this.entries = this.entries.filter(function(listener) {
          listener.element.removeEventListener(listener.event, listener.fn);
          return false;
      });
  };

  /**
   * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */ function getVariantFromSerializedArray(product, collection) {
      _validateProductStructure(product);
      // If value is an array of options
      var optionArray = _createOptionArrayFromOptionCollection(product, collection);
      return getVariantFromOptionArray(product, optionArray);
  }
  /**
   * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */ function getVariantFromOptionArray(product, options) {
      _validateProductStructure(product);
      _validateOptionsArray(options);
      var result = product.variants.filter(function(variant) {
          return options.every(function(option, index) {
              return variant.options[index] === option;
          });
      });
      return result[0] || null;
  }
  /**
   * Creates an array of selected options from the object
   * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
   * @param {Object} product Product JSON object
   * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
   */ function _createOptionArrayFromOptionCollection(product, collection) {
      _validateProductStructure(product);
      _validateSerializedArray(collection);
      var optionArray = [];
      collection.forEach(function(option) {
          for(var i = 0; i < product.options.length; i++){
              var name = product.options[i].name || product.options[i];
              if (name.toLowerCase() === option.name.toLowerCase()) {
                  optionArray[i] = option.value;
                  break;
              }
          }
      });
      return optionArray;
  }
  /**
   * Check if the product data is a valid JS object
   * Error will be thrown if type is invalid
   * @param {object} product Product JSON object
   */ function _validateProductStructure(product) {
      if (typeof product !== 'object') {
          throw new TypeError(product + ' is not an object.');
      }
      if (Object.keys(product).length === 0 && product.constructor === Object) {
          throw new Error(product + ' is empty.');
      }
  }
  /**
   * Validate the structure of the array
   * It must be formatted like jQuery's serializeArray()
   * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
   */ function _validateSerializedArray(collection) {
      if (!Array.isArray(collection)) {
          throw new TypeError(collection + ' is not an array.');
      }
      if (collection.length === 0) {
          throw new Error(collection + ' is empty.');
      }
      if (collection[0].hasOwnProperty('name')) {
          if (typeof collection[0].name !== 'string') {
              throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
          }
      } else {
          throw new Error(collection[0] + 'does not contain name key.');
      }
  }
  /**
   * Validate the structure of the array
   * It must be formatted as list of values
   * @param {Array} collection Array of object (e.g. ['36', 'Black'])
   */ function _validateOptionsArray(options) {
      if (Array.isArray(options) && typeof options[0] === 'object') {
          throw new Error(options + 'is not a valid array of options.');
      }
  }

  var selectors$i = {
      idInput: '[name="id"]',
      planInput: '[name="selling_plan"]',
      optionInput: '[name^="options"]',
      quantityInput: '[name="quantity"]',
      propertyInput: '[name^="properties"]'
  };
  /**
   * Constructor class that creates a new instance of a product form controller.
   *
   * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
   * @param {Object} product - A product object
   * @param {Object} options - Optional options object
   * @param {Function} options.onOptionChange - Callback for whenever an option input changes
   * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
   * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
   * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
   * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
   */ let ProductFormReader = class ProductFormReader {
      /**
     * Cleans up all event handlers that were assigned when the Product Form was constructed.
     * Useful for use when a section needs to be reloaded in the theme editor.
     */ destroy() {
          this._listeners.removeAll();
      }
      /**
     * Getter method which returns the array of currently selected option values
     *
     * @returns {Array} An array of option values
     */ options() {
          return this._serializeInputValues(this.optionInputs, function(item) {
              var regex = /(?:^(options\[))(.*?)(?:\])/;
              item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
              return item;
          });
      }
      /**
     * Getter method which returns the currently selected variant, or `null` if variant
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */ variant() {
          const opts = this.options();
          if (opts.length) {
              return getVariantFromSerializedArray(this.product, opts);
          } else {
              return this.product.variants[0];
          }
      }
      /**
     * Getter method which returns the current selling plan, or `null` if plan
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */ plan(variant) {
          let plan = {
              allocation: null,
              group: null,
              detail: null
          };
          const formData = new FormData(this.form);
          const id = formData.get('selling_plan');
          if (id && variant) {
              plan.allocation = variant.selling_plan_allocations.find(function(item) {
                  return item.selling_plan_id.toString() === id.toString();
              });
          }
          if (plan.allocation) {
              plan.group = this.product.selling_plan_groups.find(function(item) {
                  return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
              });
          }
          if (plan.group) {
              plan.detail = plan.group.selling_plans.find(function(item) {
                  return item.id.toString() === id.toString();
              });
          }
          if (plan && plan.allocation && plan.detail && plan.allocation) {
              return plan;
          } else return null;
      }
      /**
     * Getter method which returns a collection of objects containing name and values
     * of property inputs
     *
     * @returns {Array} Collection of objects with name and value keys
     */ properties() {
          return this._serializeInputValues(this.propertyInputs, function(item) {
              var regex = /(?:^(properties\[))(.*?)(?:\])/;
              item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
              return item;
          });
      }
      /**
     * Getter method which returns the current quantity or 1 if no quantity input is
     * included in the form
     *
     * @returns {Array} Collection of objects with name and value keys
     */ quantity() {
          return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
      }
      getFormState() {
          const variant = this.variant();
          return {
              options: this.options(),
              variant: variant,
              properties: this.properties(),
              quantity: this.quantity(),
              plan: this.plan(variant)
          };
      }
      // Private Methods
      // -----------------------------------------------------------------------------
      _setIdInputValue(variant) {
          if (variant && variant.id) {
              this.variantElement.value = variant.id.toString();
          } else {
              this.variantElement.value = '';
          }
          this.variantElement.dispatchEvent(new Event('change'));
      }
      _onSubmit(options, event) {
          event.dataset = this.getFormState();
          if (options.onFormSubmit) {
              options.onFormSubmit(event);
          }
      }
      _onOptionChange(event) {
          this._setIdInputValue(event.dataset.variant);
      }
      _onFormEvent(cb) {
          if (typeof cb === 'undefined') {
              return Function.prototype;
          }
          return (function(event) {
              event.dataset = this.getFormState();
              this._setIdInputValue(event.dataset.variant);
              cb(event);
          }).bind(this);
      }
      _initInputs(selector, cb) {
          var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));
          return elements.map((function(element) {
              this._listeners.add(element, 'change', this._onFormEvent(cb));
              return element;
          }).bind(this));
      }
      _serializeInputValues(inputs, transform) {
          return inputs.reduce(function(options, input) {
              if (input.checked || input.type !== 'radio' && input.type !== 'checkbox' // Or if its any other type of input
              ) {
                  options.push(transform({
                      name: input.name,
                      value: input.value
                  }));
              }
              return options;
          }, []);
      }
      _validateProductObject(product) {
          if (typeof product !== 'object') {
              throw new TypeError(product + ' is not an object.');
          }
          if (typeof product.variants[0].options === 'undefined') {
              throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
          }
          return product;
      }
      constructor(element, product, options){
          this.element = element;
          this.form = this.element.tagName == 'FORM' ? this.element : this.element.querySelector('form');
          this.product = this._validateProductObject(product);
          this.variantElement = this.element.querySelector(selectors$i.idInput);
          options = options || {};
          this._listeners = new Listeners();
          this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));
          this.optionInputs = this._initInputs(selectors$i.optionInput, options.onOptionChange);
          this.planInputs = this._initInputs(selectors$i.planInput, options.onPlanChange);
          this.quantityInputs = this._initInputs(selectors$i.quantityInput, options.onQuantityChange);
          this.propertyInputs = this._initInputs(selectors$i.propertyInput, options.onPropertyChange);
      }
  };

  const cookieDefaultValues = {
      expires: 7,
      path: '/',
      domain: window.location.hostname
  };
  let Cookies = class Cookies {
      /**
     * Write cookie
     * @param value - String
     */ write(value) {
          document.cookie = `${this.options.name}=${value}; expires=${this.options.expires}; path=${this.options.path}; domain=${this.options.domain}`;
      }
      /**
     * Read cookies and returns an array of values
     * @returns Array
     */ read() {
          let cookieValuesArr = [];
          const hasCookieWithThisName = document.cookie.split('; ').find((row)=>row.startsWith(this.options.name)
          );
          if (document.cookie.indexOf('; ') !== -1 && hasCookieWithThisName) {
              const cookieValue = document.cookie.split('; ').find((row)=>row.startsWith(this.options.name)
              ).split('=')[1];
              if (cookieValue !== null) {
                  cookieValuesArr = cookieValue.split(',');
              }
          }
          return cookieValuesArr;
      }
      destroy() {
          document.cookie = `${this.options.name}=null; expires=${this.options.expires}; path=${this.options.path}; domain=${this.options.domain}`;
      }
      remove(removedValue) {
          const cookieValue = this.read();
          const position = cookieValue.indexOf(removedValue);
          if (position !== -1) {
              cookieValue.splice(position, 1);
              this.write(cookieValue);
          }
      }
      constructor(options = {}){
          this.options = {
              ...cookieDefaultValues,
              ...options
          };
      }
  };

  const config = {
      howManyToShow: 4,
      howManyToStoreInMemory: 10,
      wrapper: '[data-recently-viewed-products]',
      limit: 'data-limit',
      recentWrapper: '[data-recent-wrapper]',
      apiContent: '[data-api-content]',
      productClasses: 'data-product-class',
      dataMinimum: 'data-minimum',
      hideClass: 'hide'
  };
  const cookieConfig = {
      expires: 90,
      name: 'shopify_recently_viewed'
  };
  const sections$8 = [];
  const excludedHandles = [];
  let RecentProducts = class RecentProducts {
      renderProducts() {
          const recentlyViewedHandlesArray = this.cookie.read();
          const arrayURLs = [];
          let counter = 0;
          if (recentlyViewedHandlesArray.length > 0) {
              for(let index = 0; index < recentlyViewedHandlesArray.length; index++){
                  const handle = recentlyViewedHandlesArray[index];
                  if (excludedHandles.includes(handle)) {
                      continue;
                  }
                  const url = `${window.theme.routes.root_url}products/${handle}?section_id=api-product-grid-item`;
                  arrayURLs.push(url);
                  counter++;
                  if (counter === this.howManyToShow || counter === recentlyViewedHandlesArray.length - 1) {
                      break;
                  }
              }
              if (arrayURLs.length > 0 && arrayURLs.length >= this.minimum) {
                  this.container.classList.remove(config.hideClass);
                  const fecthRequests = arrayURLs.map((url)=>fetch(url, {
                          mode: 'no-cors'
                      }).then(this.handleErrors)
                  );
                  this.productMarkups = [];
                  Promise.allSettled(fecthRequests).then((responses)=>{
                      return Promise.all(responses.map(async (response)=>{
                          if (response.status === 'fulfilled') {
                              this.productMarkups.push(await response.value.text());
                          }
                      }));
                  }).then(()=>{
                      this.productMarkups.forEach((markup)=>{
                          const buffer = document.createElement('div');
                          buffer.innerHTML = markup;
                          this.wrapper.innerHTML += buffer.querySelector(config.apiContent).innerHTML;
                      });
                  }).then(()=>{
                      showElement(this.wrapper, true);
                      this.slider = new DefaultSlider(this.container);
                  });
              }
          }
      }
      handleErrors(response) {
          if (!response.ok) {
              return response.text().then(function(text) {
                  const e = new FetchError({
                      status: response.statusText,
                      headers: response.headers,
                      text: text
                  });
                  throw e;
              });
          }
          return response;
      }
      unload() {
          if (this.slider && typeof this.slider.unload === 'function') {
              this.slider.unload();
          }
      }
      constructor(section){
          this.container = section.container;
          this.cookie = new Cookies(cookieConfig);
          this.wrapper = this.container.querySelector(config.wrapper);
          this.slider = null;
          if (this.wrapper === null) {
              return;
          }
          this.howManyToShow = parseInt(this.container.querySelector(config.recentWrapper).getAttribute(config.limit)) || config.howManyToShow;
          this.minimum = parseInt(this.container.querySelector(config.recentWrapper).getAttribute(config.dataMinimum));
          this.classes = this.container.querySelector(config.recentWrapper).getAttribute(config.productClasses).split(' ');
          this.renderProducts();
      }
  };
  let RecordRecentlyViewed = class RecordRecentlyViewed {
      updateCookie() {
          let recentlyViewed = this.cookie.read();
          // In what position is that product in memory.
          const position = recentlyViewed.indexOf(this.handle);
          // If not in memory.
          if (position === -1) {
              // Add product at the start of the list.
              recentlyViewed.unshift(this.handle);
              // Only keep what we need.
              recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
          } else {
              // Remove the product and place it at start of list.
              recentlyViewed.splice(position, 1);
              recentlyViewed.unshift(this.handle);
          }
          // Update cookie.
          this.cookie.write(recentlyViewed);
      }
      constructor(handle){
          this.handle = handle;
          this.cookie = new Cookies(cookieConfig);
          if (typeof this.handle === 'undefined') {
              return;
          }
          excludedHandles.push(this.handle);
          this.updateCookie();
      }
  };
  const recentProducts = {
      onLoad () {
          sections$8[this.id] = new RecentProducts(this);
      },
      onUnload () {
          if (typeof sections$8[this.id].unload === 'function') {
              sections$8[this.id].unload();
          }
      }
  };

  const selectors$h = {
      form: '[data-product-form]',
      optionPosition: 'data-option-position',
      optionInput: '[name^="options"], [data-popout-option]',
      selectOptionValue: 'data-value'
  };
  const classes$a = {
      soldOut: 'sold-out',
      unavailable: 'unavailable'
  };
  /**
   * Variant Sellout Pre-Crime Click Preview
   * I think of this like the pre-crime machine in Minority Report.  It gives a preview of
   * the affect for any give click action, given the current form state.  The logic is:
   *
   * for each clickable name=options[] variant selection element
   * find the value of the form if the element were clicked
   * lookup the variant with those value in the product json
   * clear the classes, add unavailable if it's not found, add sold out if it's unavailable.
   *
   * Caveat: we rely on the option position so we don't need to keep a complex map of keys and values
   */ let SelloutVariants = class SelloutVariants {
      init() {
          this.update();
      }
      update() {
          this.getCurrentState();
          this.optionElements.forEach((el)=>{
              const val = el.value || el.getAttribute(selectors$h.selectOptionValue);
              const positionString = el.closest(`[${selectors$h.optionPosition}]`).getAttribute(selectors$h.optionPosition);
              // subtract one because option.position in liquid does not count form zero, but JS arrays do
              const position = parseInt(positionString, 10) - 1;
              let newVals = [
                  ...this.selections
              ];
              newVals[position] = val;
              const found = this.productJSON.variants.find((element)=>{
                  // only return true if every option matches our hypothetical selection
                  let perfectMatch = true;
                  for(let index = 0; index < newVals.length; index++){
                      if (element.options[index] !== newVals[index]) {
                          perfectMatch = false;
                      }
                  }
                  return perfectMatch;
              });
              el.classList.remove(classes$a.soldOut, classes$a.unavailable);
              if (typeof found === 'undefined') {
                  el.classList.add(classes$a.unavailable);
              } else if ((found === null || found === void 0 ? void 0 : found.available) === false) {
                  el.classList.add(classes$a.soldOut);
              }
          });
      }
      getCurrentState() {
          this.formData = new FormData(this.form);
          this.selections = [];
          for (var value of this.formData.entries()){
              if (value[0].includes('options[')) {
                  // push the current state of the form, dont worry about the group name
                  // we will be using the array position instead of the name to match values
                  this.selections.push(value[1]);
              }
          }
      }
      constructor(wrapper, productJSON){
          this.container = wrapper;
          this.productJSON = productJSON;
          this.form = this.container.querySelector(selectors$h.form);
          this.formData = new FormData(this.form);
          this.optionElements = this.form.querySelectorAll(selectors$h.optionInput);
          if (this.productJSON && this.form) {
              this.init();
          }
      }
  };

  const selectors$g = {
      productForm: '[data-product-form]',
      outerSection: '[data-section-id]',
      productSlideshow: 'data-product-slideshow',
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      comparePrice: '[data-compare-price]',
      comparePriceText: '[data-compare-text]',
      buttonsWrapper: '[data-buttons-wrapper]',
      originalSelectorId: '[data-product-select]',
      priceWrapper: '[data-price-wrapper]',
      priceButton: '[data-button-price]',
      productJson: '[data-product-json]',
      productPrice: '[data-product-price]',
      unitPrice: '[data-product-unit-price]',
      unitBase: '[data-product-base]',
      unitWrapper: '[data-product-unit]',
      dataEnableHistoryState: 'data-enable-history-state',
      optionPosition: 'data-option-position',
      optionValue: '[data-option-value]',
      subPrices: '[data-subscription-watch-price]',
      subSelectors: '[data-subscription-selectors]',
      priceOffWrap: '[data-price-off]',
      priceOffType: '[data-price-off-type]',
      priceOffAmount: '[data-price-off-amount]',
      subsToggle: '[data-toggles-group]',
      subsChild: 'data-group-toggle',
      subDescription: '[data-plan-description]',
      remainingCount: '[data-remaining-count]',
      remainingMax: '[data-remaining-max]',
      remainingMaxAttr: 'data-remaining-max',
      remainingWrapper: '[data-remaining-wrapper]',
      remainingJSON: '[data-product-remaining-json]',
      isPreOrder: '[data-product-preorder]',
      idInput: '[name="id"]',
      upsellModal: '[data-upsell-modal]'
  };
  const classes$9 = {
      hide: 'hide',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
      productPriceSale: 'product__price--sale',
      remainingLow: 'count-is-low',
      remainingIn: 'count-is-in',
      remainingOut: 'count-is-out',
      remainingUnavailable: 'count-is-unavailable',
      upsellModal: '[data-upsell-modal]'
  };
  let ProductForm = class ProductForm extends HTMLElement {
      init() {
          let productJSONText = null;
          this.productJSON = null;
          const productElemJSON = this.container.querySelector(selectors$g.productJson);
          if (productElemJSON) {
              productJSONText = productElemJSON.innerHTML;
          }
          if (productJSONText && this.container) {
              this.productJSON = JSON.parse(productJSONText);
              this.linkForm();
              this.sellout = new SelloutVariants(this.container, this.productJSON);
          } else {
              console.warn('Missing product form or product JSON');
          }
          // Add cookie for recent products, also fires when upsell form is opened
          new RecordRecentlyViewed(this.productJSON.handle);
      }
      destroy() {
          this.productForm.destroy();
      }
      linkForm() {
          this.productForm = new ProductFormReader(this.container, this.productJSON, {
              onOptionChange: this.onOptionChange.bind(this),
              onPlanChange: this.onPlanChange.bind(this),
              onQuantityChange: this.onQuantityChange.bind(this)
          });
          this.pushState(this.productForm.getFormState());
          this.subsToggleListeners();
      }
      onOptionChange(evt) {
          this.pushState(evt.dataset);
      }
      onPlanChange(evt) {
          if (this.subPrices) {
              this.pushState(evt.dataset);
          }
      }
      onQuantityChange(evt) {
          const formState = evt.dataset;
          this.productState = this.setProductState(formState);
          this.updateButtonPrices(formState);
      }
      pushState(formState) {
          var ref;
          this.productState = this.setProductState(formState);
          this.updateProductImage(formState);
          this.updateAddToCartState(formState);
          this.updateProductPrices(formState);
          this.updateSaleText(formState);
          this.updateSubscriptionText(formState);
          this.updateLegend(formState);
          this.updateRemaining(formState);
          this.fireHookEvent(formState);
          (ref = this.sellout) === null || ref === void 0 ? void 0 : ref.update(formState);
          if (this.enableHistoryState) {
              this.updateHistoryState(formState);
          }
      }
      updateAddToCartState(formState) {
          const variant = formState.variant;
          let addText = theme.strings.addToCart;
          const priceWrapper = this.outerWrapper.querySelectorAll(selectors$g.priceWrapper);
          const buttonsWrapper = this.container.querySelector(selectors$g.buttonsWrapper);
          const addToCart = buttonsWrapper.querySelectorAll(selectors$g.addToCart);
          const addToCartText = buttonsWrapper.querySelectorAll(selectors$g.addToCartText);
          if (this.isPreOrder) {
              addText = theme.strings.preOrder;
          }
          if (priceWrapper.length && variant) {
              priceWrapper.forEach((element)=>{
                  element.classList.remove(classes$9.hide);
              });
          }
          if (addToCart.length) {
              addToCart.forEach((element)=>{
                  if (variant) {
                      if (variant.available) {
                          element.disabled = false;
                      } else {
                          element.disabled = true;
                      }
                  } else {
                      element.disabled = true;
                  }
              });
          }
          if (addToCartText.length) {
              addToCartText.forEach((element)=>{
                  if (variant) {
                      if (variant.available) {
                          element.innerHTML = addText;
                      } else {
                          element.innerHTML = theme.strings.soldOut;
                      }
                  } else {
                      element.innerHTML = theme.strings.unavailable;
                  }
              });
          }
          if (buttonsWrapper) {
              if (variant) {
                  if (variant.available) {
                      buttonsWrapper.classList.remove(classes$9.variantSoldOut, classes$9.variantUnavailable);
                  } else {
                      buttonsWrapper.classList.add(classes$9.variantSoldOut);
                      buttonsWrapper.classList.remove(classes$9.variantUnavailable);
                  }
                  const formSelect = buttonsWrapper.querySelector(selectors$g.originalSelectorId);
                  if (formSelect) {
                      formSelect.value = variant.id;
                  }
              } else {
                  buttonsWrapper.classList.add(classes$9.variantUnavailable);
                  buttonsWrapper.classList.remove(classes$9.variantSoldOut);
              }
          }
      }
      updateLegend(formState) {
          const variant = formState.variant;
          if (variant) {
              const vals = this.container.querySelectorAll(selectors$g.optionValue);
              vals.forEach((val)=>{
                  const wrapper = val.closest(`[${selectors$g.optionPosition}]`);
                  if (wrapper) {
                      const position = wrapper.getAttribute(selectors$g.optionPosition);
                      const index = parseInt(position, 10) - 1;
                      const newValue = variant.options[index];
                      val.innerHTML = newValue;
                  }
              });
          }
      }
      updateHistoryState(formState) {
          const variant = formState.variant;
          const plan = formState.plan;
          const location = window.location.href;
          if (variant && location.includes('/product')) {
              const url = new window.URL(location);
              const params = url.searchParams;
              params.set('variant', variant.id);
              if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
                  params.set('selling_plan', plan.detail.id);
              } else {
                  params.delete('selling_plan');
              }
              url.search = params.toString();
              const urlString = url.toString();
              window.history.replaceState({
                  path: urlString
              }, '', urlString);
          }
      }
      updateRemaining(formState) {
          const variant = formState.variant;
          if (variant && this.remainingWrapper && this.remainingJSON && this.remainingCount) {
              const newQuantity = this.remainingJSON[variant.id];
              if (newQuantity && newQuantity <= this.remainingMaxInt && newQuantity > 0) {
                  this.remainingWrapper.classList.remove(classes$9.remainingIn, classes$9.remainingOut, classes$9.remainingUnavailable);
                  this.remainingWrapper.classList.add(classes$9.remainingLow);
                  this.remainingCount.innerHTML = newQuantity;
              } else if (this.productState.soldOut) {
                  this.remainingWrapper.classList.remove(classes$9.remainingLow, classes$9.remainingIn, classes$9.remainingUnavailable);
                  this.remainingWrapper.classList.add(classes$9.remainingOut);
              } else if (this.productState.available) {
                  this.remainingWrapper.classList.remove(classes$9.remainingLow, classes$9.remainingOut, classes$9.remainingUnavailable);
                  this.remainingWrapper.classList.add(classes$9.remainingIn);
              }
          } else if (this.remainingWrapper) {
              this.remainingWrapper.classList.remove(classes$9.remainingIn, classes$9.remainingOut, classes$9.remainingLow);
              this.remainingWrapper.classList.add(classes$9.remainingUnavailable);
          }
      }
      getBaseUnit(variant) {
          return variant.unit_price_measurement.reference_value === 1 ? variant.unit_price_measurement.reference_unit : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
      }
      subsToggleListeners() {
          const toggles = this.container.querySelectorAll(selectors$g.subsToggle);
          toggles.forEach((toggle)=>{
              toggle.addEventListener('change', (function(e) {
                  const val = e.target.value.toString();
                  const selected = this.container.querySelector(`[${selectors$g.subsChild}="${val}"]`);
                  const groups = this.container.querySelectorAll(`[${selectors$g.subsChild}]`);
                  if (selected) {
                      selected.classList.remove(classes$9.hide);
                      const first = selected.querySelector(`[name="selling_plan"]`);
                      first.checked = true;
                      first.dispatchEvent(new Event('change'));
                  }
                  groups.forEach((group)=>{
                      if (group !== selected) {
                          group.classList.add(classes$9.hide);
                          const plans = group.querySelectorAll(`[name="selling_plan"]`);
                          plans.forEach((plan)=>{
                              plan.checked = false;
                              plan.dispatchEvent(new Event('change'));
                          });
                      }
                  });
              }).bind(this));
          });
      }
      updateSaleText(formState) {
          if (this.productState.planSale) {
              this.updateSaleTextSubscription(formState);
          } else if (this.productState.onSale) {
              this.updateSaleTextStandard(formState);
          } else {
              this.priceOffWrap.forEach((element)=>{
                  element.classList.add(classes$9.hide);
              });
          }
      }
      updateSaleTextStandard(formState) {
          if (this.priceOffType.length === 0) return;
          this.priceOffType.forEach((element)=>{
              element.innerHTML = window.theme.strings.sale || 'sale';
          });
          const variant = formState.variant;
          if (window.theme.settings.badge_sale_type && window.theme.settings.badge_sale_type === 'percentage') {
              const discountFloat = (variant.compare_at_price - variant.price) / variant.compare_at_price;
              const discountInt = Math.floor(discountFloat * 100);
              this.priceOffAmount.forEach((element)=>{
                  element.innerHTML = `${discountInt}%`;
              });
          } else {
              const discount = variant.compare_at_price - variant.price;
              this.priceOffAmount.forEach((element)=>{
                  element.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(discount, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(discount, theme.moneyFormat);
              });
          }
          this.priceOffWrap.forEach((element)=>{
              element.classList.remove(classes$9.hide);
          });
      }
      updateSaleTextSubscription(formState) {
          this.priceOffType.forEach((element)=>{
              element.innerHTML = window.theme.strings.subscription || 'subscripton';
          });
          const variant = formState.variant;
          const adjustment = formState.plan.detail.price_adjustments[0];
          const discount = adjustment.value;
          if (adjustment && adjustment.value_type === 'percentage') {
              this.priceOffAmount.forEach((element)=>{
                  element.innerHTML = `${discount}%`;
              });
          } else if (adjustment && adjustment.value_type === 'price') {
              this.priceOffAmount.forEach((element)=>{
                  element.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(variant.price - adjustment.value, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(variant.price - adjustment.value, theme.moneyFormat);
              });
          } else {
              this.priceOffAmount.forEach((element)=>{
                  element.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(discount, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(discount, theme.moneyFormat);
              });
          }
          this.priceOffWrap.forEach((element)=>{
              element.classList.remove(classes$9.hide);
          });
      }
      updateSubscriptionText(formState) {
          if (formState.plan && this.planDescription.length > 0 && formState.plan.detail.description !== null) {
              this.planDescription.forEach((element)=>{
                  element.innerHTML = formState.plan.detail.description;
                  element.classList.remove(classes$9.hide);
              });
          } else if (this.planDescription.length > 0) {
              this.planDescription.forEach((element)=>{
                  element.classList.add(classes$9.hide);
              });
          }
      }
      getPrices(formState) {
          const variant = formState.variant;
          const plan = formState.plan;
          let comparePrice = '';
          let price = '';
          if (this.productState.available) {
              comparePrice = variant.compare_at_price;
              price = variant.price;
          }
          if (this.productState.hasPlan) {
              price = plan.allocation.price;
          }
          if (this.productState.planSale) {
              comparePrice = plan.allocation.compare_at_price;
              price = plan.allocation.price;
          }
          return {
              price: price,
              comparePrice: comparePrice
          };
      }
      updateButtonPrices(formState) {
          const priceButtons = this.container.querySelectorAll(selectors$g.priceButton);
          const { price  } = this.getPrices(formState);
          if (priceButtons.length) {
              priceButtons.forEach((btn)=>{
                  const btnPrice = formState.quantity * price;
                  btn.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(btnPrice, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(btnPrice, theme.moneyFormat);
              });
          }
      }
      updateProductPrices(formState) {
          const variant = formState.variant;
          const priceWrappers = this.outerWrapper.querySelectorAll(selectors$g.priceWrapper);
          const priceButtons = this.outerWrapper.querySelectorAll(selectors$g.priceButton);
          const { price , comparePrice  } = this.getPrices(formState);
          priceWrappers.forEach((wrap)=>{
              const comparePriceEl = wrap.querySelector(selectors$g.comparePrice);
              const productPriceEl = wrap.querySelector(selectors$g.productPrice);
              const comparePriceText = wrap.querySelector(selectors$g.comparePriceText);
              if (comparePriceEl) {
                  if (this.productState.onSale || this.productState.planSale) {
                      comparePriceEl.classList.remove(classes$9.hide);
                      comparePriceText.classList.remove(classes$9.hide);
                      productPriceEl.classList.add(classes$9.productPriceSale);
                  } else {
                      comparePriceEl.classList.add(classes$9.hide);
                      comparePriceText.classList.add(classes$9.hide);
                      productPriceEl.classList.remove(classes$9.productPriceSale);
                  }
                  comparePriceEl.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(comparePrice, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(comparePrice, theme.moneyFormat);
              }
              if (productPriceEl) {
                  if (variant) {
                      productPriceEl.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(price, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(price, theme.moneyFormat);
                  } else {
                      productPriceEl.innerHTML = '&nbsp;';
                  }
              }
          });
          if (priceButtons.length) {
              priceButtons.forEach((btn)=>{
                  const btnPrice = formState.quantity * price;
                  btn.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(btnPrice, theme.moneyFormat) + ` ${theme.currencyCode}` : themeCurrency.formatMoney(btnPrice, theme.moneyFormat);
              });
          }
          if (this.hasUnitPricing.length > 0) {
              this.updateProductUnits(formState);
          }
      }
      updateProductUnits(formState) {
          const variant = formState.variant;
          const plan = formState.plan;
          let unitPrice = null;
          if (variant && variant.unit_price) {
              unitPrice = variant.unit_price;
          }
          if (plan && plan.allocation && plan.allocation.unit_price) {
              unitPrice = plan.allocation.unit_price;
          }
          if (unitPrice) {
              const base = this.getBaseUnit(variant);
              const formattedPrice = themeCurrency.formatMoney(unitPrice, theme.moneyFormat);
              this.outerWrapper.querySelectorAll(selectors$g.unitPrice).forEach((element)=>{
                  element.innerHTML = theme.settings.currency_code_enable ? formattedPrice + ` ${theme.currencyCode}` : formattedPrice;
              });
              this.outerWrapper.querySelectorAll(selectors$g.unitBase).forEach((element)=>{
                  element.innerHTML = base;
              });
              this.outerWrapper.querySelectorAll(selectors$g.unitWrapper).forEach((element)=>{
                  showElement(element);
              });
          } else {
              this.outerWrapper.querySelectorAll(selectors$g.unitWrapper).forEach((element)=>{
                  hideElement(element);
              });
          }
      }
      fireHookEvent(formState) {
          const variant = formState.variant;
          this.container.dispatchEvent(new CustomEvent('theme:variant:change', {
              detail: {
                  variant: variant
              },
              bubbles: true
          }));
      }
      /**
     * Tracks aspects of the product state that are relevant to UI updates
     * @param {object} evt - variant change event
     * @return {object} productState - represents state of variant + plans
     *  productState.available - current variant and selling plan options result in valid offer
     *  productState.soldOut - variant is sold out
     *  productState.onSale - variant is on sale
     *  productState.showUnitPrice - variant has unit price
     *  productState.requiresPlan - all the product variants requires a selling plan
     *  productState.hasPlan - there is a valid selling plan
     *  productState.planSale - plan has a discount to show next to price
     *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscribtion
     */ setProductState(dataset) {
          const variant = dataset.variant;
          const plan = dataset.plan;
          const productState = {
              available: true,
              soldOut: false,
              onSale: false,
              showUnitPrice: false,
              requiresPlan: false,
              hasPlan: false,
              planPerDelivery: false,
              planSale: false
          };
          if (!variant || variant.requires_selling_plan && !plan) {
              productState.available = false;
          } else {
              if (!variant.available) {
                  productState.soldOut = true;
              }
              if (variant.compare_at_price > variant.price) {
                  productState.onSale = true;
              }
              if (variant.unit_price) {
                  productState.showUnitPrice = true;
              }
              if (this.productJSON && this.productJSON.requires_selling_plan) {
                  productState.requiresPlan = true;
              }
              if (plan && this.subPrices) {
                  productState.hasPlan = true;
                  if (plan.allocation.per_delivery_price !== plan.allocation.price) {
                      productState.planPerDelivery = true;
                  }
                  if (variant.price > plan.allocation.price) {
                      productState.planSale = true;
                  }
              }
          }
          return productState;
      }
      updateProductImage(formState) {
          const variant = formState.variant;
          if (!this.slideshow && this.outerSection) {
              this.slideshow = this.outerSection.querySelector(`[${selectors$g.productSlideshow}="${this.productJSON.handle}"]`);
          }
          if (this.slideshow && variant && variant.featured_media && variant.featured_media.id) {
              // Update variant image, if one is set
              this.slideshow.dispatchEvent(new CustomEvent('theme:image:change', {
                  detail: {
                      id: variant.featured_media.id
                  }
              }));
          }
      }
      constructor(){
          var ref;
          super();
          this.container = this;
          this.outerSection = this.container.closest(selectors$g.outerSection);
          this.upsell = this.container.closest(selectors$g.upsellModal);
          this.enableHistoryState = ((ref = this.outerSection) === null || ref === void 0 ? void 0 : ref.getAttribute(selectors$g.dataEnableHistoryState)) === 'true';
          // Allow selection of additional price elemenets for mobile design
          this.outerWrapper = this.upsell ? this.upsell : this.container.closest(selectors$g.outerSection) || this.container;
          this.priceOffWrap = this.outerWrapper.querySelectorAll(selectors$g.priceOffWrap);
          this.priceOffAmount = this.outerWrapper.querySelectorAll(selectors$g.priceOffAmount);
          this.priceOffType = this.outerWrapper.querySelectorAll(selectors$g.priceOffType);
          this.hasUnitPricing = this.outerWrapper.querySelectorAll(selectors$g.unitWrapper);
          this.subSelectors = this.container.querySelector(selectors$g.subSelectors);
          this.subPrices = this.container.querySelector(selectors$g.subPrices);
          this.planDescription = this.container.querySelectorAll(selectors$g.subDescription);
          this.isPreOrder = this.container.querySelector(selectors$g.isPreOrder);
          this.sellout = null;
          this.productForm = null;
          this.remainingWrapper = this.container.querySelector(selectors$g.remainingWrapper);
          if (this.remainingWrapper) {
              const remainingMaxWrap = this.container.querySelector(selectors$g.remainingMax);
              this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(selectors$g.remainingMaxAttr), 10);
              this.remainingCount = this.container.querySelector(selectors$g.remainingCount);
              this.remainingJSONWrapper = this.container.querySelector(selectors$g.remainingJSON);
              this.remainingJSON = null;
              if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
                  this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
              } else {
                  console.warn('Missing product quantity JSON');
              }
          }
          initQtySection(this.container);
          this.init();
      }
  };

  const selectors$f = {
      slideshow: '[data-product-slideshow]',
      singeImage: '[data-product-image]',
      zoomButton: '[data-zoom-button]',
      zoomWrapper: '[data-zoom-wrapper]',
      mediaId: '[data-media-id]',
      mediaIdAttr: 'data-media-id'
  };
  function productPhotoswipeZoom(container, json) {
      const loadedPromise = loadScript$1({
          url: window.theme.assets.photoswipe
      });
      const returnZoom = loadedPromise.then(()=>{
          const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
          const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;
          const triggers = container.querySelectorAll(selectors$f.zoomButton);
          triggers.forEach((trigger)=>{
              trigger.addEventListener('click', (event)=>{
                  const el = container.querySelector(selectors$f.zoomWrapper);
                  const dataId = event.target.closest(selectors$f.mediaId).getAttribute(selectors$f.mediaIdAttr).toString();
                  const items = [];
                  for(let i = 0; i < json.media.length; i++){
                      if (json.media[i].media_type === 'image') {
                          items[items.length] = {
                              src: json.media[i].src,
                              w: json.media[i].width,
                              h: json.media[i].height,
                              id: json.media[i].id
                          };
                      }
                  }
                  const findImage = (element)=>element.id.toString() === dataId
                  ;
                  const index = items.findIndex(findImage);
                  const options = {
                      index,
                      showHideOpacity: true,
                      showAnimationDuration: 150,
                      hideAnimationDuration: 250,
                      bgOpacity: 1,
                      spacing: 0,
                      allowPanToNext: false,
                      maxSpreadZoom: 3,
                      history: false,
                      loop: true,
                      pinchToClose: false,
                      modal: false,
                      closeOnScroll: false,
                      closeOnVerticalDrag: true,
                      getDoubleTapZoom: function getDoubleTapZoom(isMouseClick, item) {
                          if (isMouseClick) {
                              return 1.67;
                          } else {
                              return item.initialZoomLevel < 0.7 ? 1 : 1.3;
                          }
                      },
                      getThumbBoundsFn: function getThumbBoundsFn() {
                          let imageLocation = container.querySelector(selectors$f.slideshow);
                          if (!imageLocation) {
                              imageLocation = container.querySelector(selectors$f.singeImage);
                          }
                          const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                          const rect = imageLocation.getBoundingClientRect();
                          return {
                              x: rect.left,
                              y: rect.top + pageYScroll,
                              w: rect.width
                          };
                      }
                  };
                  el.dispatchEvent(new CustomEvent('theme:scroll:lock', {
                      bubbles: true
                  }));
                  // Initializes and opens PhotoSwipe
                  let windowWidth = null;
                  const gallery = new PhotoSwipe(el, PhotoSwipeUI, items, options);
                  gallery.updateSize = new Proxy(gallery.updateSize, {
                      apply: (target)=>windowWidth !== window.innerWidth && (target(options), windowWidth = window.innerWidth)
                  });
                  gallery.init();
                  gallery.listen('close', function() {
                      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {
                          bubbles: true
                      }));
                  });
              });
          });
      }).catch((e)=>console.error(e)
      );
      return returnZoom;
  }

  const selectors$e = {
      urlInput: '[data-share-url]',
      section: 'data-section-type',
      shareDetails: '[data-share-details]',
      shareSummary: '[data-share-summary]',
      shareCopy: '[data-share-copy]',
      shareButton: '[data-share-button]',
      closeButton: '[data-close-button]',
      successMessage: '[data-success-message]',
      shareHolder: '[data-share-holder]'
  };
  const classes$8 = {
      hidden: 'is-hidden'
  };
  let ShareButton = class ShareButton extends HTMLElement {
      init() {
          if (navigator.share) {
              this.mainDetailsToggle.setAttribute('hidden', '');
              this.shareButton.classList.remove(classes$8.hidden);
              this.shareButton.addEventListener('click', ()=>{
                  navigator.share({
                      url: this.urlToShare,
                      title: document.title
                  });
              });
          } else {
              this.mainDetailsToggle.addEventListener('toggle', this.toggleDetails.bind(this));
              this.mainDetailsToggle.addEventListener('focusout', ()=>{
                  setTimeout(()=>{
                      if (!this.contains(document.activeElement)) {
                          this.close();
                      }
                  });
              });
              this.shareCopy.addEventListener('click', this.copyToClipboard.bind(this));
              this.closeButton.addEventListener('click', this.close.bind(this));
              this.container.addEventListener('keyup', this.keyboardEvents.bind(this));
          }
      }
      updateShareLink() {
          if (this.container.getAttribute(selectors$e.section) == 'product') {
              this.container.addEventListener('theme:variant:change', (event)=>{
                  this.urlToShare = `${this.urlToShare.split('?')[0]}?variant=${event.detail.variant.id}`;
                  if (this.urlInput) {
                      this.urlInput.value = `${this.urlToShare.split('?')[0]}?variant=${event.detail.variant.id}`;
                  }
              });
          }
      }
      toggleDetails() {
          if (!this.mainDetailsToggle.open) {
              this.successMessage.classList.add(classes$8.hidden);
              this.successMessage.textContent = '';
              this.closeButton.classList.add(classes$8.hidden);
              this.shareCopy.focus();
          }
      }
      copyToClipboard() {
          navigator.clipboard.writeText(this.urlInput.value).then(()=>{
              this.successMessage.classList.remove(classes$8.hidden);
              this.successMessage.textContent = theme.strings.successMessage;
              this.closeButton.classList.remove(classes$8.hidden);
              this.closeButton.focus();
          });
      }
      close() {
          this.mainDetailsToggle.removeAttribute('open');
          this.shareSummary.setAttribute('aria-expanded', false);
      }
      keyboardEvents(e) {
          if (e.which !== window.theme.keyboardKeys.ESCAPE) {
              return;
          }
          this.mainDetailsToggle.focus();
          this.close();
      }
      constructor(){
          super();
          this.container = this.closest(`[${selectors$e.section}]`);
          this.mainDetailsToggle = this.querySelector(selectors$e.shareDetails);
          this.shareButton = this.querySelector(selectors$e.shareButton);
          this.shareCopy = this.querySelector(selectors$e.shareCopy);
          this.shareSummary = this.querySelector(selectors$e.shareSummary);
          this.closeButton = this.querySelector(selectors$e.closeButton);
          this.successMessage = this.querySelector(selectors$e.successMessage);
          this.shareHolder = this.querySelector(selectors$e.shareHolder);
          this.urlInput = this.querySelector(selectors$e.urlInput);
          this.urlToShare = this.urlInput ? this.urlInput.value : document.location.href;
          this.init();
          this.updateShareLink();
      }
  };

  const selectors$d = {
      dataVideoId: 'videoid',
      player: '[data-player]',
      dataEnableVideoLooping: 'data-enable-video-looping'
  };
  const classes$7 = {
      playBtn: 'lty-playbtn',
      visuallyHidden: 'lyt-visually-hidden',
      activated: 'lyt-activated'
  };
  let LiteYTEmbed = class LiteYTEmbed extends HTMLElement {
      connectedCallback() {
          this.videoId = this.getAttribute(selectors$d.dataVideoId);
          let playBtnEl = this.querySelector(`.${classes$7.playBtn}`);
          // A label for the button takes priority over a [playlabel] attribute on the custom-element
          this.playLabel = playBtnEl && playBtnEl.textContent.trim() || this.getAttribute('playlabel') || 'Play';
          /**
       * Lo, the youtube placeholder image!  (aka the thumbnail, poster image, etc)
       *
       * See https://github.com/paulirish/lite-youtube-embed/blob/master/youtube-thumbnail-urls.md
       *
       * TODO: Do the sddefault->hqdefault fallback
       *       - When doing this, apply referrerpolicy (https://github.com/ampproject/amphtml/pull/3940)
       * TODO: Consider using webp if supported, falling back to jpg
       */ if (!this.style.backgroundImage) {
              this.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg")`;
          }
          // Set up play button, and its visually hidden label
          if (!playBtnEl) {
              playBtnEl = document.createElement('button');
              playBtnEl.type = 'button';
              playBtnEl.classList.add(classes$7.playBtn);
              this.append(playBtnEl);
          }
          if (!playBtnEl.textContent) {
              const playBtnLabelEl = document.createElement('span');
              playBtnLabelEl.className = classes$7.visuallyHidden;
              playBtnLabelEl.textContent = this.playLabel;
              playBtnEl.append(playBtnLabelEl);
          }
          // On hover (or tap), warm up the TCP connections we're (likely) about to use.
          this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
              once: true
          });
          // Once the user clicks, add the real iframe and drop our play button
          // TODO: In the future we could be like amp-youtube and silently swap in the iframe during idle time
          //   We'd want to only do this for in-viewport or near-viewport ones: https://github.com/ampproject/amphtml/pull/5003
          this.addEventListener('click', this.addIframe);
      }
      // // TODO: Support the the user changing the [videoid] attribute
      // attributeChangedCallback() {
      // }
      /**
     * Add a <link rel={preload | preconnect} ...> to the head
     */ static addPrefetch(kind, url, as) {
          const linkEl = document.createElement('link');
          linkEl.rel = kind;
          linkEl.href = url;
          if (as) {
              linkEl.as = as;
          }
          document.head.append(linkEl);
      }
      /**
     * Begin pre-connecting to warm up the iframe load
     * Since the embed's network requests load within its iframe,
     *   preload/prefetch'ing them outside the iframe will only cause double-downloads.
     * So, the best we can do is warm up a few connections to origins that are in the critical path.
     *
     * Maybe `<link rel=preload as=document>` would work, but it's unsupported: http://crbug.com/593267
     * But TBH, I don't think it'll happen soon with Site Isolation and split caches adding serious complexity.
     */ static warmConnections() {
          if (LiteYTEmbed.preconnected) return;
          // The iframe document and most of its subresources come right off youtube.com
          LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
          // The botguard script is fetched off from google.com
          LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');
          // Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling.
          LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
          LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
          LiteYTEmbed.preconnected = true;
      }
      addIframe(e) {
          if (this.classList.contains(classes$7.activated)) return;
          e.preventDefault();
          this.classList.add(classes$7.activated);
          const parent = this.closest(selectors$d.player);
          if (parent) {
              const uniqueKey = parent.dataset.player;
              const loop = this.hasAttribute(selectors$d.dataEnableVideoLooping) ? this.getAttribute(selectors$d.dataEnableVideoLooping) === 'true' : false;
              embedYoutube(uniqueKey, {
                  autoplay: true,
                  playlist: this.videoId,
                  loop: loop
              });
          } else {
              const params = new URLSearchParams(this.getAttribute('params') || []);
              params.append('autoplay', '1');
              const iframeEl = document.createElement('iframe');
              iframeEl.width = 560;
              iframeEl.height = 315;
              // No encoding necessary as [title] is safe. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#:~:text=Safe%20HTML%20Attributes%20include
              iframeEl.title = this.playLabel;
              iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
              iframeEl.allowFullscreen = true;
              // AFAIK, the encoding here isn't necessary for XSS, but we'll do it only because this is a URL
              // https://stackoverflow.com/q/64959723/89484
              iframeEl.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${params.toString()}`;
              this.append(iframeEl);
              // Set focus for a11y
              iframeEl.focus();
          }
      }
  };

  const selectors$c = {
      elements: {
          scrollbar: 'data-scrollbar-slider',
          scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
          scrollbarArrowNext: '[data-scrollbar-arrow-next]'
      },
      classes: {
          hide: 'is-hidden'
      },
      times: {
          delay: 200
      }
  };
  let NativeScrollbar = class NativeScrollbar {
      init() {
          if (this.arrowNext && this.arrowPrev) {
              this.toggleNextArrow();
              this.events();
          }
      }
      resize() {
          document.addEventListener('theme:resize', ()=>{
              this.toggleNextArrow();
          });
      }
      events() {
          this.arrowNext.addEventListener('click', (event)=>{
              event.preventDefault();
              this.goToNext();
          });
          this.arrowPrev.addEventListener('click', (event)=>{
              event.preventDefault();
              this.goToPrev();
          });
          this.scrollbar.addEventListener('scroll', ()=>{
              this.togglePrevArrow();
              this.toggleNextArrow();
          });
      }
      goToNext() {
          const position = this.scrollbar.getBoundingClientRect().width / 2 + this.scrollbar.scrollLeft;
          this.move(position);
          this.arrowPrev.classList.remove(selectors$c.classes.hide);
          this.toggleNextArrow();
      }
      goToPrev() {
          const position = this.scrollbar.scrollLeft - this.scrollbar.getBoundingClientRect().width / 2;
          this.move(position);
          this.arrowNext.classList.remove(selectors$c.classes.hide);
          this.togglePrevArrow();
      }
      toggleNextArrow() {
          setTimeout(()=>{
              this.arrowNext.classList.toggle(selectors$c.classes.hide, Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
          }, selectors$c.times.delay);
      }
      togglePrevArrow() {
          setTimeout(()=>{
              this.arrowPrev.classList.toggle(selectors$c.classes.hide, this.scrollbar.scrollLeft <= 0);
          }, selectors$c.times.delay);
      }
      scrollToVisibleElement() {
          [].forEach.call(this.scrollbar.children, (element)=>{
              element.addEventListener('click', (event)=>{
                  event.preventDefault();
                  this.move(element.offsetLeft - element.clientWidth);
              });
          });
      }
      move(offsetLeft) {
          this.scrollbar.scrollTo({
              top: 0,
              left: offsetLeft,
              behavior: 'smooth'
          });
      }
      constructor(scrollbar){
          this.scrollbar = scrollbar;
          this.arrowNext = this.scrollbar.parentNode.querySelector(selectors$c.elements.scrollbarArrowNext);
          this.arrowPrev = this.scrollbar.parentNode.querySelector(selectors$c.elements.scrollbarArrowPrev);
          this.init();
          this.resize();
          if (this.scrollbar.hasAttribute(selectors$c.elements.scrollbar)) {
              this.scrollToVisibleElement();
          }
      }
  };

  const selectors$b = {
      body: 'body',
      dataRelatedSectionElem: '[data-related-section]',
      dataTabsHolder: '[data-tabs-holder]',
      dataTab: 'data-tab',
      dataTabIndex: 'data-tab-index',
      blockId: 'data-block-id',
      tabsLi: '.tabs > button',
      tabLink: '.tab-link',
      tabLinkRecent: '.tab-link__recent',
      tabContent: '.tab-content',
      scrollbarHolder: '[data-scrollbar]',
      scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
      scrollbarArrowNext: '[data-scrollbar-arrow-next]',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
  };
  const classes$6 = {
      classCurrent: 'current',
      classHide: 'hide',
      classAlt: 'alt',
      focusEnabled: 'focus-enabled'
  };
  const sections$7 = {};
  let GlobalTabs = class GlobalTabs {
      init() {
          const ctx = this.container;
          const tabsNavList = ctx.querySelectorAll(selectors$b.tabsLi);
          const firstTabLink = ctx.querySelector(`${selectors$b.tabLink}-0`);
          const firstTabContent = ctx.querySelector(`${selectors$b.tabContent}-0`);
          if (firstTabContent) {
              firstTabContent.classList.add(classes$6.classCurrent);
          }
          if (firstTabLink) {
              firstTabLink.classList.add(classes$6.classCurrent);
          }
          this.checkVisibleTabLinks();
          this.container.addEventListener('tabs:checkRecentTab', ()=>this.checkRecentTab()
          );
          this.container.addEventListener('tabs:hideRelatedTab', ()=>this.hideRelatedTab()
          );
          if (tabsNavList.length) {
              tabsNavList.forEach((element)=>{
                  const tabId = parseInt(element.getAttribute(selectors$b.dataTab));
                  const tab = ctx.querySelector(`${selectors$b.tabContent}-${tabId}`);
                  element.addEventListener('click', ()=>{
                      this.tabChange(element, tab);
                  });
                  element.addEventListener('keyup', (event)=>{
                      if ((event.which === window.theme.keyboardKeys.SPACE || event.which === window.theme.keyboardKeys.ENTER) && this.body.classList.contains(classes$6.focusEnabled)) {
                          this.tabChange(element, tab);
                          if (tab.querySelector(selectors$b.focusable)) {
                              trapFocus(tab, {
                                  elementToFocus: tab.querySelector(selectors$b.focusable)
                              });
                          }
                      }
                  });
                  tab.addEventListener('keyup', (event)=>{
                      if (event.which === window.theme.keyboardKeys.ESCAPE && this.body.classList.contains(classes$6.focusEnabled)) {
                          removeTrapFocus();
                          element.focus();
                      }
                  });
              });
          }
      }
      tabChange(element, tab) {
          this.container.querySelector(`${selectors$b.tabsLi}.${classes$6.classCurrent}`).classList.remove(classes$6.classCurrent);
          this.container.querySelector(`${selectors$b.tabContent}.${classes$6.classCurrent}`).classList.remove(classes$6.classCurrent);
          element.classList.add(classes$6.classCurrent);
          tab.classList.add(classes$6.classCurrent);
          if (element.classList.contains(classes$6.classHide)) {
              tab.classList.add(classes$6.classHide);
          }
          this.checkVisibleTabLinks();
          this.container.dispatchEvent(new CustomEvent('theme:tab:change'));
      }
      initNativeScrollbar() {
          if (this.scrollbarHolder.length) {
              this.scrollbarHolder.forEach((scrollbar)=>{
                  new NativeScrollbar(scrollbar);
              });
          }
      }
      checkVisibleTabLinks() {
          const tabsNavList = this.container.querySelectorAll(selectors$b.tabsLi);
          const tabsNavListHided = this.container.querySelectorAll(`${selectors$b.tabLink}.${classes$6.classHide}`);
          const difference = tabsNavList.length - tabsNavListHided.length;
          if (difference < 2) {
              this.container.classList.add(classes$6.classAlt);
          } else {
              this.container.classList.remove(classes$6.classAlt);
          }
      }
      checkRecentTab() {
          const tabLink = this.container.querySelector(selectors$b.tabLinkRecent);
          if (tabLink) {
              tabLink.classList.remove(classes$6.classHide);
              const tabLinkIdx = parseInt(tabLink.getAttribute(selectors$b.dataTab));
              const tabContent = this.container.querySelector(`${selectors$b.tabContent}[${selectors$b.dataTabIndex}="${tabLinkIdx}"]`);
              if (tabContent) {
                  tabContent.classList.remove(classes$6.classHide);
              }
              this.checkVisibleTabLinks();
              this.initNativeScrollbar();
          }
      }
      hideRelatedTab() {
          const relatedSection = this.container.querySelector(selectors$b.dataRelatedSectionElem);
          if (!relatedSection) {
              return;
          }
          const parentTabContent = relatedSection.closest(`${selectors$b.tabContent}.${classes$6.classCurrent}`);
          if (!parentTabContent) {
              return;
          }
          const parentTabContentIdx = parseInt(parentTabContent.getAttribute(selectors$b.dataTabIndex));
          const tabsNavList = this.container.querySelectorAll(selectors$b.tabsLi);
          if (tabsNavList.length > parentTabContentIdx) {
              const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;
              if (nextTabsNavLink) {
                  tabsNavList[parentTabContentIdx].classList.add(classes$6.classHide);
                  nextTabsNavLink.dispatchEvent(new Event('click'));
                  this.initNativeScrollbar();
              }
          }
      }
      onBlockSelect(evt) {
          const element = this.container.querySelector(`${selectors$b.tabLink}[${selectors$b.blockId}="${evt.detail.blockId}"]`);
          if (element) {
              element.dispatchEvent(new Event('click'));
              element.parentNode.scrollTo({
                  top: 0,
                  left: element.offsetLeft - element.clientWidth,
                  behavior: 'smooth'
              });
          }
      }
      constructor(holder){
          this.container = holder;
          this.body = document.querySelector(selectors$b.body);
          if (this.container) {
              this.scrollbarHolder = this.container.querySelectorAll(selectors$b.scrollbarHolder);
              this.init();
              // Init native scrollbar
              this.initNativeScrollbar();
          }
      }
  };
  const tabs = {
      onLoad () {
          sections$7[this.id] = [];
          const tabHolders = this.container.querySelectorAll(selectors$b.dataTabsHolder);
          tabHolders.forEach((holder)=>{
              sections$7[this.id].push(new GlobalTabs(holder));
          });
      },
      onBlockSelect (e) {
          sections$7[this.id].forEach((el)=>{
              if (typeof el.onBlockSelect === 'function') {
                  el.onBlockSelect(e);
              }
          });
      }
  };

  const selectors$a = {
      groupImage: 'data-image-filter',
      slider: '[data-product-slideshow]',
      thumbSlider: '[data-product-thumbs]',
      thumbs: '[data-slideshow-thumbnail]',
      slides: '[data-media-slide]'
  };
  const classes$5 = {
      hide: 'hide',
      flickityEnable: 'flickity-enabled'
  };
  let GroupVariantImages = class GroupVariantImages {
      listen() {
          this.container.addEventListener('theme:variant:change', (event)=>{
              var ref;
              this.variantImage = (ref = event.detail.variant) === null || ref === void 0 ? void 0 : ref.featured_image;
              this.filterImages();
          });
      }
      filterImages() {
          if (this.variantImage === null || this.variantImage === undefined) {
              this.resetImages();
              this.refreshSliders();
              return;
          }
          if (this.variantImage && this.variantImage.alt !== null) {
              this.variantImageAlt = this.variantImage.alt.split('#')[1];
              this.showImages();
          } else {
              this.resetImages();
          }
          this.refreshSliders();
      }
      resetImages() {
          this.thumbs.forEach((thumb)=>thumb.classList.remove(classes$5.hide)
          );
          this.slides.forEach((slide)=>slide.classList.remove(classes$5.hide)
          );
      }
      showImages() {
          this.thumbs.forEach((thumb)=>{
              if (thumb.getAttribute(selectors$a.groupImage) === '' || thumb.getAttribute(selectors$a.groupImage) === this.variantImageAlt) {
                  thumb.classList.remove(classes$5.hide);
              } else {
                  thumb.classList.add(classes$5.hide);
              }
          });
          this.slides.forEach((slide)=>{
              if (slide.getAttribute(selectors$a.groupImage) === '' || slide.getAttribute(selectors$a.groupImage) === this.variantImageAlt) {
                  slide.classList.remove(classes$5.hide);
              } else {
                  slide.classList.add(classes$5.hide);
              }
          });
      }
      refreshSliders() {
          if (this.slider !== null) {
              if (this.slider.classList.contains(classes$5.flickityEnable)) {
                  const slider = FlickityFade.data(this.slider);
                  if (typeof slider !== 'undefined') {
                      slider.reloadCells();
                  }
              }
          }
          if (this.thumbSlider !== null) {
              if (this.thumbSlider.classList.contains(classes$5.flickityEnable)) {
                  const thumbSlider = FlickitySync.data(this.thumbSlider);
                  if (typeof thumbSlider !== 'undefined') {
                      thumbSlider.reloadCells();
                  }
              }
          }
      }
      constructor(section){
          this.section = section;
          this.container = section.container;
          this.slider = this.container.querySelector(selectors$a.slider);
          this.thumbSlider = this.container.querySelector(selectors$a.thumbSlider);
          this.thumbs = this.container.querySelectorAll(selectors$a.thumbs);
          this.slides = this.container.querySelectorAll(selectors$a.slides);
          this.variantImage = null;
          this.listen();
      }
  };

  const selectors$9 = {
      productForm: '[data-product-form]',
      productJson: '[data-product-json]',
      popupButton: '[data-toggle-product-modal]',
      zoomButton: '[data-zoom-button]',
      toggleTruncateHolder: '[data-truncated-holder]',
      toggleTruncateButton: '[data-truncated-button]',
      toggleTruncateContent: '[data-truncated-content]',
      toggleTruncateContentAttr: 'data-truncated-content'
  };
  const classes$4 = {
      classExpanded: 'is-expanded',
      classVisible: 'is-visible'
  };
  const sections$6 = [];
  let ProductTemplate = class ProductTemplate {
      init() {
          this.zoomEnabled = this.container.querySelector(selectors$9.zoomButton) !== null;
          if (this.zoomEnabled) {
              productPhotoswipeZoom(this.container, this.product);
          }
          if (this.truncateElementHolder && this.truncateElement) {
              setTimeout(this.resizeEventTruncate, 50);
              document.addEventListener('theme:resize', this.resizeEventTruncate);
          }
      }
      truncateText() {
          if (this.truncateElementHolder.classList.contains(classes$4.classVisible)) return;
          const styles = this.truncateElement.querySelectorAll('style');
          if (styles.length) {
              styles.forEach((style)=>{
                  this.truncateElementHolder.prepend(style);
              });
          }
          const truncateElementCloned = this.truncateElement.cloneNode(true);
          const truncateElementClass = this.truncateElement.getAttribute(selectors$9.toggleTruncateContentAttr);
          const truncateNextElement = this.truncateElement.nextElementSibling;
          if (truncateNextElement) {
              truncateNextElement.remove();
          }
          this.truncateElement.parentElement.append(truncateElementCloned);
          const truncateAppendedElement = this.truncateElement.nextElementSibling;
          truncateAppendedElement.classList.add(truncateElementClass);
          truncateAppendedElement.removeAttribute(selectors$9.toggleTruncateContentAttr);
          showElement(truncateAppendedElement);
          ellipsis(truncateAppendedElement, 5, {
              replaceStr: '',
              delimiter: ' '
          });
          hideElement(truncateAppendedElement);
          if (this.truncateElement.innerHTML !== truncateAppendedElement.innerHTML) {
              this.truncateElementHolder.classList.add(classes$4.classExpanded);
          } else {
              truncateAppendedElement.remove();
              this.truncateElementHolder.classList.remove(classes$4.classExpanded);
          }
          this.toggleTruncatedContent(this.truncateElementHolder);
      }
      toggleTruncatedContent(holder) {
          const toggleButton = holder.querySelector(selectors$9.toggleTruncateButton);
          if (toggleButton) {
              toggleButton.addEventListener('click', (e)=>{
                  e.preventDefault();
                  holder.classList.remove(classes$4.classExpanded);
                  holder.classList.add(classes$4.classVisible);
              });
          }
      }
      onBlockSelect(event) {
          const block = this.container.querySelector(`[data-block-id="${event.detail.blockId}"]`);
          if (block) {
              block.dispatchEvent(new Event('click'));
          }
      }
      onBlockDeselect(event) {
          const block = this.container.querySelector(`[data-block-id="${event.detail.blockId}"]`);
          if (block) {
              block.dispatchEvent(new Event('click'));
          }
      }
      onUnload() {
          this.media.destroy();
          if (this.truncateElementHolder && this.truncateElement) {
              document.removeEventListener('theme:resize', this.resizeEventTruncate);
          }
      }
      constructor(section){
          this.section = section;
          this.id = section.id;
          this.container = section.container;
          this.settings = section.settings;
          this.productFormElement = this.container.querySelector(selectors$9.productForm);
          modal(this.id);
          this.media = new Media(section);
          new GroupVariantImages(section);
          const productJSON = this.container.querySelector(selectors$9.productJson);
          if (productJSON && productJSON.innerHTML !== '') {
              this.product = JSON.parse(productJSON.innerHTML);
          } else {
              console.error('Missing product JSON');
              return;
          }
          this.truncateElementHolder = this.container.querySelector(selectors$9.toggleTruncateHolder);
          this.truncateElement = this.container.querySelector(selectors$9.toggleTruncateContent);
          this.resizeEventTruncate = ()=>this.truncateText()
          ;
          this.init();
      }
  };
  const productSection = {
      onLoad () {
          sections$6[this.id] = new ProductTemplate(this);
      },
      onUnload () {
          if (typeof sections$6[this.id].unload === 'function') {
              sections$6[this.id].unload();
          }
      },
      onBlockSelect (evt) {
          if (typeof sections$6[this.id].onBlockSelect === 'function') {
              sections$6[this.id].onBlockSelect(evt);
          }
      },
      onBlockDeselect (evt) {
          if (typeof sections$6[this.id].onBlockDeselect === 'function') {
              sections$6[this.id].onBlockDeselect(evt);
          }
      }
  };
  register('product', [
      productSection,
      pickupAvailability,
      productAddSection,
      accordion,
      tabs,
      swapperSection
  ]);
  if (!customElements.get('product-form')) {
      customElements.define('product-form', ProductForm);
  }
  if (!customElements.get('radio-swatch')) {
      customElements.define('radio-swatch', RadioSwatch);
  }
  if (!customElements.get('popout-select')) {
      customElements.define('popout-select', PopoutSelect);
  }
  if (!customElements.get('upsell-product')) {
      customElements.define('upsell-product', UpsellProduct);
  }
  if (!customElements.get('share-button')) {
      customElements.define('share-button', ShareButton);
  }
  if (!customElements.get('lite-youtube')) {
      customElements.define('lite-youtube', LiteYTEmbed);
  }

  const relatedSection = {
      onLoad: function() {
          const relatedSection1 = this.container;
          const parent = relatedSection1.parentElement;
          const productId = this.container.getAttribute('data-product-id');
          const limit = this.container.getAttribute('data-limit');
          const sectionID = this.container.getAttribute('data-section-id');
          const route = window.theme.routes.product_recommendations_url || '/recommendations/products/';
          const requestUrl = `${route}?section_id=${sectionID}&limit=${limit}&product_id=${productId}`;
          parent.style.display = 'none';
          fetch(requestUrl).then((response)=>response.text()
          ).then((response)=>{
              const fresh = document.createElement('div');
              fresh.innerHTML = response;
              parent.innerHTML = fresh.querySelector('[data-related-section]').innerHTML;
              slideDown(parent);
              setTimeout(()=>{
                  new DefaultSlider(parent);
              }, 600);
          }).catch((error)=>console.log(error)
          );
      }
  };
  register('related', relatedSection);

  register('reviews', [
      slider,
      blockScroll
  ]);

  const selectors$8 = {
      button: '[data-scroll-down]'
  };
  let ScrollButton = class ScrollButton {
      init() {
          const buttons = this.wrapper.querySelectorAll(selectors$8.button);
          if (buttons) {
              buttons.forEach((btn)=>{
                  btn.addEventListener('click', this.scroll.bind(this));
              });
          }
      }
      scroll() {
          const bottom = this.wrapper.offsetTop + this.wrapper.clientHeight;
          window.scroll({
              top: bottom,
              left: 0,
              behavior: 'smooth'
          });
      }
      constructor(el){
          this.wrapper = el;
          this.init();
      }
  };
  const scrollButton = {
      onLoad () {
          this.scrollButton = new ScrollButton(this.container);
      },
      onUnload: function() {
          delete this.scrollButton;
      }
  };

  const sections$5 = [];
  const selectors$7 = {
      wrapper: '[data-slideshow-wrapper]',
      speed: 'data-slideshow-speed',
      autoplay: 'data-slideshow-autoplay',
      slideCount: 'data-slideshow-slides',
      prevButton: '[slide-custom-prev]',
      nextButton: '[slide-custom-next]',
      flickityDisableClass: 'flickity-disabled-mobile',
      flickityEnabled: 'flickity-enabled'
  };
  let Slideshow = class Slideshow {
      init() {
          const settings = {
              autoPlay: this.autoplay && this.speed ? parseInt(this.speed) : false,
              contain: false,
              pageDots: true,
              adaptiveHeight: true,
              accessibility: true,
              wrapAround: this.slideCount !== 2,
              prevNextButtons: false,
              draggable: true,
              fade: true,
              watchCSS: true
          };
          this.flkty = new FlickityFade(this.wrapper, settings);
          if (this.prevButtons.length) {
              this.prevButtons.forEach((e)=>{
                  e.onclick = ()=>{
                      this.flkty.previous(true, false);
                  };
              });
          }
          if (this.nextButtons.length) {
              this.nextButtons.forEach((e)=>{
                  e.onclick = ()=>{
                      this.flkty.next(true, false);
                  };
              });
          }
          this.stopSlider();
          document.addEventListener('theme:resize', this.resizeEvent);
          document.addEventListener('theme:scroll', this.scrollEvent);
      }
      scrollEvents() {
          if (this.flkty && this.autoplay && this.speed) {
              const slideshow = this.flkty.element;
              const slideshowBottomPosition = slideshow.getBoundingClientRect().top + window.scrollY + slideshow.offsetHeight;
              if (window.pageYOffset > slideshowBottomPosition) {
                  if (this.flkty.player.state === 'playing') {
                      this.flkty.pausePlayer();
                  }
              } else if (this.flkty.player.state === 'paused') {
                  this.flkty.playPlayer();
              }
          }
      }
      resizeEvents() {
          this.stopSlider();
      }
      stopSlider() {
          var ref;
          if (window.innerWidth < window.theme.sizes.medium && ((ref = this.wrapper) === null || ref === void 0 ? void 0 : ref.classList.contains(selectors$7.flickityDisableClass))) {
              new CustomScrollbar(this.container);
          }
      }
      unload() {
          document.removeEventListener('theme:resize', this.resizeEvent);
          document.removeEventListener('theme:scroll', this.scrollEvent);
          if (this.flkty) {
              this.flkty.destroy();
          }
      }
      onBlockSelect(evt) {
          const indexEl = evt.target.closest('[data-slideshow-index]');
          const slideIndex = indexEl.getAttribute('data-slideshow-index');
          const select = parseInt(slideIndex, 10);
          if (this.flkty && this.flkty.element && this.flkty.element.classList.contains(selectors$7.flickityEnabled)) {
              this.flkty.selectCell(select);
              this.flkty.pausePlayer();
          }
      }
      onBlockDeselect() {
          if (this.autoplay) {
              this.flkty.unpausePlayer();
          }
      }
      constructor(section){
          this.container = section.container;
          this.wrapper = this.container.querySelector(selectors$7.wrapper);
          this.speed = this.wrapper.getAttribute(selectors$7.speed);
          this.autoplay = this.wrapper.getAttribute(selectors$7.autoplay) === 'true';
          this.slideCount = parseInt(this.wrapper.getAttribute(selectors$7.slideCount), 10);
          this.prevButtons = this.wrapper.querySelectorAll(selectors$7.prevButton);
          this.nextButtons = this.wrapper.querySelectorAll(selectors$7.nextButton);
          this.flkty = null;
          this.scrollEvent = ()=>this.scrollEvents()
          ;
          this.resizeEvent = ()=>this.resizeEvents()
          ;
          this.init();
      }
  };
  const slideshowSection = {
      onLoad () {
          sections$5[this.id] = new Slideshow(this);
      },
      onUnload () {
          if (typeof sections$5[this.id].unload === 'function') {
              sections$5[this.id].unload();
          }
      },
      onBlockSelect (evt) {
          if (typeof sections$5[this.id].onBlockSelect === 'function') {
              sections$5[this.id].onBlockSelect(evt);
          }
      },
      onBlockDeselect (evt) {
          if (typeof sections$5[this.id].onBlockSelect === 'function') {
              sections$5[this.id].onBlockDeselect(evt);
          }
      }
  };
  register('slideshow', [
      slideshowSection,
      scrollButton,
      blockScroll
  ]);

  register('team', [
      slider,
      blockScroll
  ]);

  var styles = {};
  styles.basic = [];
  /* eslint-disable */ styles.light = [
      {
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'on'
              },
              {
                  lightness: '64'
              },
              {
                  hue: '#ff0000'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  color: '#bdbdbd'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [
              {
                  color: '#f0f0f0'
              },
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'landscape.natural.landcover',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'landscape.natural.terrain',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'geometry.fill',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [
              {
                  lightness: '100'
              }
          ]
      },
      {
          featureType: 'poi.park',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'on'
              }
          ]
      },
      {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
              {
                  saturation: '-41'
              },
              {
                  color: '#e8ede7'
              }
          ]
      },
      {
          featureType: 'poi.park',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'all',
          stylers: [
              {
                  saturation: '-100'
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
              {
                  lightness: '25'
              },
              {
                  gamma: '1.06'
              },
              {
                  saturation: '-100'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
              {
                  gamma: '10.00'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              },
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.fill',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.fill',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  gamma: '10.00'
              },
              {
                  lightness: '100'
              },
              {
                  weight: '0.4'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'simplified'
              },
              {
                  weight: '0.01'
              },
              {
                  lightness: '39'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  weight: '0.50'
              },
              {
                  gamma: '10.00'
              },
              {
                  lightness: '100'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'water',
          elementType: 'all',
          stylers: [
              {
                  color: '#cfe5ee'
              },
              {
                  visibility: 'on'
              }
          ]
      }, 
  ];
  styles.light_blank = [
      {
          featureType: 'all',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              },
              {
                  lightness: '64'
              },
              {
                  hue: '#ff0000'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  color: '#bdbdbd'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [
              {
                  color: '#f0f0f0'
              },
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'landscape.natural.landcover',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'landscape.natural.terrain',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'geometry.fill',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [
              {
                  lightness: '100'
              }
          ]
      },
      {
          featureType: 'poi.park',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'on'
              }
          ]
      },
      {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
              {
                  saturation: '-41'
              },
              {
                  color: '#e8ede7'
              }
          ]
      },
      {
          featureType: 'poi.park',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'all',
          stylers: [
              {
                  saturation: '-100'
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
              {
                  lightness: '25'
              },
              {
                  gamma: '1.06'
              },
              {
                  saturation: '-100'
              },
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
              {
                  gamma: '10.00'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              },
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.fill',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.fill',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  gamma: '10.00'
              },
              {
                  lightness: '100'
              },
              {
                  weight: '0.4'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              },
              {
                  weight: '0.01'
              },
              {
                  lightness: '39'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  weight: '0.50'
              },
              {
                  gamma: '10.00'
              },
              {
                  lightness: '100'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'water',
          elementType: 'all',
          stylers: [
              {
                  color: '#cfe5ee'
              },
              {
                  visibility: 'on'
              }
          ]
      }, 
  ];
  styles.white_blank = [
      {
          featureType: 'all',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  color: '#444444'
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [
              {
                  color: '#f2f2f2'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'all',
          stylers: [
              {
                  saturation: -100
              },
              {
                  lightness: 45
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'water',
          elementType: 'all',
          stylers: [
              {
                  color: '#e4e4e4'
              },
              {
                  visibility: 'on'
              }
          ]
      }, 
  ];
  styles.white_label = [
      {
          featureType: 'all',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [
              {
                  gamma: '3.86'
              },
              {
                  lightness: '100'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  color: '#cccccc'
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [
              {
                  color: '#f2f2f2'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'all',
          stylers: [
              {
                  saturation: -100
              },
              {
                  lightness: 45
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'labels.text',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'water',
          elementType: 'all',
          stylers: [
              {
                  color: '#e4e4e4'
              },
              {
                  visibility: 'on'
              }
          ]
      }, 
  ];
  styles.dark_blank = [
      {
          featureType: 'all',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  saturation: 36
              },
              {
                  color: '#000000'
              },
              {
                  lightness: 40
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  visibility: 'on'
              },
              {
                  color: '#000000'
              },
              {
                  lightness: 16
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 20
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 17
              },
              {
                  weight: 1.2
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 20
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 21
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 17
              },
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 29
              },
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 18
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 16
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 19
              }
          ]
      },
      {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 17
              }
          ]
      }, 
  ];
  styles.dark_label = [
      {
          featureType: 'all',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [
              {
                  saturation: 36
              },
              {
                  color: '#000000'
              },
              {
                  lightness: 40
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  visibility: 'on'
              },
              {
                  color: '#000000'
              },
              {
                  lightness: 16
              }
          ]
      },
      {
          featureType: 'all',
          elementType: 'labels.icon',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 20
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 17
              },
              {
                  weight: 1.2
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'simplified'
              },
              {
                  lightness: '-82'
              }
          ]
      },
      {
          featureType: 'administrative',
          elementType: 'labels.text.stroke',
          stylers: [
              {
                  invert_lightness: true
              },
              {
                  weight: '7.15'
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 20
              }
          ]
      },
      {
          featureType: 'landscape',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 21
              }
          ]
      },
      {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'simplified'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 17
              },
              {
                  weight: '0.8'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 29
              },
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 18
              }
          ]
      },
      {
          featureType: 'road.arterial',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 16
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'geometry.stroke',
          stylers: [
              {
                  weight: '0.01'
              }
          ]
      },
      {
          featureType: 'road.local',
          elementType: 'labels',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'all',
          stylers: [
              {
                  visibility: 'off'
              }
          ]
      },
      {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 19
              }
          ]
      },
      {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
              {
                  color: '#000000'
              },
              {
                  lightness: 17
              }
          ]
      }, 
  ];
  /* eslint-enable */ function mapStyle(key) {
      return styles[key];
  }

  window.theme.allMaps = window.theme.allMaps || {};
  let allMaps = window.theme.allMaps;
  let Map = class Map {
      initMaps() {
          const urlKey = `https://maps.googleapis.com/maps/api/js?key=${this.key}`;
          loadScript$1({
              url: urlKey
          }).then(()=>{
              return this.enableCorrection === 'true' && this.lat !== '' && this.long !== '' ? new window.google.maps.LatLng(this.lat, this.long) : geocodeAddressPromise(this.address);
          }).then((center)=>{
              var zoom = parseInt(this.zoomString, 10);
              const styles = mapStyle(this.styleString);
              var mapOptions = {
                  zoom,
                  styles,
                  center,
                  draggable: true,
                  clickableIcons: false,
                  scrollwheel: false,
                  zoomControl: false,
                  disableDefaultUI: true
              };
              const map = createMap(this.mapWrap, mapOptions);
              return map;
          }).then((map)=>{
              this.map = map;
              allMaps[this.id] = map;
          }).catch((e)=>{
              console.log('Failed to load Google Map');
              console.log(e);
          });
      }
      onUnload() {
          if (typeof window.google !== 'undefined') {
              window.google.maps.event.clearListeners(this.map, 'resize');
          }
      }
      constructor(section){
          this.container = section.container;
          this.mapWrap = this.container.querySelector('[data-map-container]');
          this.styleString = this.container.getAttribute('data-style') || '';
          this.key = this.container.getAttribute('data-api-key');
          this.zoomString = this.container.getAttribute('data-zoom') || 14;
          this.address = this.container.getAttribute('data-address');
          this.enableCorrection = this.container.getAttribute('data-latlong-correction');
          this.lat = this.container.getAttribute('data-lat');
          this.long = this.container.getAttribute('data-long');
          if (this.key) {
              this.initMaps();
          }
      }
  };
  function createMap(container, options) {
      var map = new window.google.maps.Map(container, options);
      var center = map.getCenter();
      new window.google.maps.Marker({
          map: map,
          position: center
      });
      window.google.maps.event.addDomListener(window, 'resize', function() {
          window.google.maps.event.trigger(map, 'resize');
          map.setCenter(center);
      });
      return map;
  }
  function geocodeAddressPromise(address) {
      return new Promise((resolve, reject)=>{
          var geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({
              address: address
          }, function(results, status) {
              if (status == 'OK') {
                  var latLong = {
                      lat: results[0].geometry.location.lat(),
                      lng: results[0].geometry.location.lng()
                  };
                  resolve(latLong);
              } else {
                  reject(status);
              }
          });
      });
  }
  const mapSection = {
      onLoad () {
          allMaps[this.id] = new Map(this);
      },
      onUnload () {
          if (typeof allMaps[this.id].unload === 'function') {
              allMaps[this.id].unload();
          }
      }
  };
  register('section-map', mapSection);

  register('hero', [
      parallaxImage,
      scrollButton
  ]);

  register('video', [
      scrollButton,
      popupVideoSection
  ]);

  const selectors$6 = {
      videoButton: '[data-video-button]',
      backgroundVideo: '[data-background-video]',
      attrUnique: 'data-unique',
      attrVideoId: 'data-video-id',
      attrVideoType: 'data-video-type',
      attrVideoAutoplay: 'data-video-autoplay',
      attrLoop: 'data-video-loop',
      playerWrapper: '[data-player]',
      dataSectionVideoOnload: 'data-section-video-onload'
  };
  const classes$3 = {
      isLoaded: 'is-loaded'
  };
  let sections$4 = {};
  let VideoAPIPlayer = class VideoAPIPlayer {
      init() {
          if (this.triggers.length) {
              this.button = this.triggers[0];
              if (this.videoOnLoad) {
                  this.loadVideos();
              } else {
                  this.triggers.forEach((trigger)=>{
                      trigger.addEventListener('click', (event)=>this.loadVideos(event)
                      );
                  });
              }
          }
      }
      loadVideos(event) {
          if (event && event.currentTarget) {
              this.button = event.currentTarget;
          }
          if (this.button) {
              this.unique = this.button.hasAttribute(selectors$6.attrUnique) ? this.button.getAttribute(selectors$6.attrUnique) : null;
              this.video = this.button.hasAttribute(selectors$6.attrVideoId) ? this.button.getAttribute(selectors$6.attrVideoId) : null;
              this.type = this.button.hasAttribute(selectors$6.attrVideoType) ? this.button.getAttribute(selectors$6.attrVideoType) : null;
              this.autoplay = this.button.hasAttribute(selectors$6.attrVideoAutoplay) ? this.button.getAttribute(selectors$6.attrVideoAutoplay) !== 'false' : true;
              this.loop = this.button.hasAttribute(selectors$6.attrLoop) ? this.button.getAttribute(selectors$6.attrLoop) !== 'false' : true;
          }
          if (this.unique && this.video && this.type) {
              const uniqueKey = `${this.video}-${this.unique}`;
              if (this.type === 'vimeo') {
                  if (this.loadedVideoPlayer) {
                      this.loadedVideoPlayer.play();
                      this.scrollToVideo(this.loadedVideoPlayer.element);
                  } else {
                      embedVimeo(uniqueKey, {
                          autoplay: this.autoplay,
                          background: false,
                          loop: this.loop,
                          controls: true,
                          muted: true,
                          playsinline: true
                      }).then((player)=>{
                          return this.vimeoBackground(player);
                      }).catch((err)=>{
                          console.error(err);
                      });
                  }
              }
              if (this.type === 'youtube') {
                  if (this.loadedVideoPlayer) {
                      this.loadedVideoPlayer.playVideo();
                      this.scrollToVideo(this.loadedVideoPlayer.getIframe());
                  } else {
                      embedYoutube(uniqueKey, {
                          autoplay: this.autoplay,
                          cc_load_policy: 0,
                          iv_load_policy: 0,
                          modestbranding: 1,
                          playsinline: 1,
                          fs: 0,
                          controls: 1,
                          mute: 1
                      }).then((player)=>{
                          return this.youtubeBackground(player);
                      }).catch((err)=>{
                          console.error(err);
                      });
                  }
              }
          }
      }
      youtubeBackground(player) {
          this.loadedVideoPlayer = player;
          this.scrollToVideo(player.getIframe());
          player.addEventListener('onStateChange', (event)=>{
              if (event.data === 0) {
                  if (this.loop) {
                      event.target.playVideo();
                  } else {
                      this.videoLoadedToggle(true);
                      this.nativeVideoEvents(true);
                  }
              }
              if (event.data === 1) {
                  event.target.mute();
                  event.target.playVideo();
                  this.nativeVideoEvents();
                  this.videoLoadedToggle();
              }
          });
          return player;
      }
      vimeoBackground(player) {
          this.loadedVideoPlayer = player;
          this.scrollToVideo(player.element);
          player.on('play', ()=>{
              this.nativeVideoEvents();
              this.videoLoadedToggle();
          });
          player.on('ended', ()=>{
              this.nativeVideoEvents(true);
              this.videoLoadedToggle(true);
          });
          return player;
      }
      videoLoadedToggle(videoStop = false) {
          this.container.classList.toggle(classes$3.isLoaded, !videoStop);
      }
      nativeVideoEvents(play = false) {
          if (this.backgroundVideo && typeof this.backgroundVideo.pause === 'function') {
              if (play) {
                  this.backgroundVideo.play();
              } else {
                  this.backgroundVideo.pause();
              }
          }
      }
      scrollToVideo(element) {
          const playerParent = element.closest(selectors$6.playerWrapper);
          if (!this.videoOnLoad && playerParent) {
              const pageTop = window.pageYOffset;
              const pageBottom = pageTop + window.innerHeight;
              const playerParentPosition = playerParent.getBoundingClientRect().top + window.scrollY;
              const playerParentBottomPosition = playerParentPosition + playerParent.offsetHeight;
              if (pageTop > playerParentPosition || pageBottom < playerParentBottomPosition) {
                  window.scroll({
                      top: playerParentPosition,
                      left: 0,
                      behavior: 'smooth'
                  });
              }
          }
      }
      constructor(section){
          this.container = section.container;
          this.videoOnLoad = this.container.hasAttribute(selectors$6.dataSectionVideoOnload);
          this.triggers = this.container.querySelectorAll(selectors$6.videoButton);
          this.backgroundVideo = this.container.querySelector(selectors$6.backgroundVideo);
          this.button = null;
          this.unique = null;
          this.video = null;
          this.type = null;
          this.autoplay = true;
          this.loop = true;
          this.loadedVideoPlayer = null;
          this.init();
      }
  };
  const videoSection = {
      onLoad () {
          sections$4[this.id] = new VideoAPIPlayer(this);
      },
      onUnload () {
          if (typeof sections$4[this.id].unload === 'function') {
              sections$4[this.id].unload();
          }
      }
  };
  register('video-player', videoSection);

  const selectors$5 = {
      trigger: '[data-toggle-password-modal]',
      errors: '.storefront-password-form .errors'
  };
  const sections$3 = {};
  let PasswordPage = class PasswordPage {
      init() {
          modal('password');
          if (this.errors) {
              this.trigger.click();
          }
      }
      constructor(section){
          this.container = section.container;
          this.trigger = this.container.querySelector(selectors$5.trigger);
          this.errors = this.container.querySelector(selectors$5.errors);
          this.init();
      }
  };
  const passwordSection = {
      onLoad () {
          sections$3[this.id] = new PasswordPage(this);
      }
  };
  register('password', passwordSection);

  const selectors$4 = {
      zoomImage: '[data-image-zoom]',
      attrUnique: 'data-unique'
  };
  let GalleryZoom = class GalleryZoom {
      init() {
          this.triggers.forEach((trigger)=>{
              const unique = trigger.getAttribute(selectors$4.attrUnique);
              MicroModal.init({
                  disableScroll: true,
                  openTrigger: `data-popup-${unique}`,
                  onShow: (modal)=>{
                      var images = modal.querySelectorAll('[data-src]', modal);
                      images.forEach((image)=>{
                          if (image.getAttribute('src') === null) {
                              const bigImage = image.getAttribute('data-src');
                              image.setAttribute('src', bigImage);
                          }
                      });
                  },
                  onClose: (modal, el, event)=>{
                      event.preventDefault();
                  }
              });
          });
      }
      constructor(container){
          this.triggers = container.querySelectorAll(selectors$4.zoomImage);
          this.init();
      }
  };
  const galleryZoomSection = {
      onLoad () {
          new GalleryZoom(this.container);
      }
  };

  register('gallery', [
      galleryZoomSection,
      popupVideoSection,
      customScrollbar,
      blockScroll
  ]);

  register('recent-products', recentProducts);

  const selectors$3 = {
      ajaxDisable: 'data-ajax-disable',
      shipping: '[data-shipping-estimate-form]',
      input: '[data-update-cart]',
      update: '[data-update-button]',
      bottom: '[data-cart-bottom]',
      upsellProduct: '[data-upsell-holder]',
      upsellButton: '[data-add-action-wrapper]'
  };
  const cartSection = {
      onLoad () {
          this.disabled = this.container.getAttribute(selectors$3.ajaxDisable) == 'true';
          if (this.disabled) {
              this.cart = new DiabledCart(this);
              return;
          }
          this.cart = new CartItems(this);
          const initPromise = this.cart.init();
          initPromise.then(()=>{
              this.cart.loadHTML();
          });
          const hasShipping = this.container.querySelector(selectors$3.shipping);
          if (hasShipping) {
              new ShippingCalculator(this);
          }
      }
  };
  let DiabledCart = class DiabledCart {
      initQuantity() {
          initQtySection(this.container);
      }
      moveUpsell() {
          const bottom = this.container.querySelector(selectors$3.bottom);
          bottom.insertBefore(this.upsellProduct, bottom.firstChild);
          new UpsellProduct(this.section, true);
      }
      initInputs() {
          this.inputs.forEach((input)=>{
              input.addEventListener('change', (function() {
                  this.updateBtn.classList.add('cart--dirty');
                  this.updateBtn.classList.add('heartBeat');
                  setTimeout((function() {
                      this.updateBtn.classList.remove('heartBeat');
                  }).bind(this), 1300);
              }).bind(this));
          });
      }
      constructor(section){
          this.section = section;
          this.container = section.container;
          this.inputs = this.container.querySelectorAll(selectors$3.input);
          this.quantityWrappers = this.container.querySelectorAll(selectors$3.qty);
          this.updateBtn = this.container.querySelector(selectors$3.update);
          this.upsellProduct = this.container.querySelector(selectors$3.upsellProduct);
          this.initQuantity();
          this.initInputs();
          if (this.upsellProduct) {
              this.moveUpsell();
          }
      }
  };
  register('cart', [
      cartSection,
      accordion
  ]);

  register('search-page', [
      sort,
      collectionFiltersSidebar,
      collectionFiltersForm,
      accordion
  ]);
  if (!customElements.get('popout-select')) {
      customElements.define('popout-select', PopoutSelect);
  }

  register('section-collection-grid', [
      slider,
      blockScroll
  ]);

  register('tabs', tabs);

  register('section-blog', slider);

  register('columns', [
      slider,
      blockScroll
  ]);

  const fadeIn = (el, display, callback = null)=>{
      el.style.opacity = 0;
      el.style.display = display || 'block';
      (function fade() {
          let val = parseFloat(el.style.opacity);
          if (!((val += 0.1) > 1)) {
              el.style.opacity = val;
              requestAnimationFrame(fade);
          }
          if (val === 1 && typeof callback === 'function') {
              callback();
          }
      })();
  };

  const fadeOut = (el, callback = null)=>{
      el.style.opacity = 1;
      (function fade() {
          if ((el.style.opacity -= 0.1) < 0) {
              el.style.display = 'none';
          } else {
              requestAnimationFrame(fade);
          }
          if (parseFloat(el.style.opacity) === 0 && typeof callback === 'function') {
              callback();
          }
      })();
  };

  const selectors$2 = {
      newsletterForm: '[data-newsletter-form]'
  };
  const classes$2 = {
      success: 'has-success',
      error: 'has-error'
  };
  const sections$2 = {};
  let NewsletterCheckForResult = class NewsletterCheckForResult {
      init() {
          this.newsletter.addEventListener('submit', this.newsletterSubmit);
          this.showMessage();
      }
      newsletterSubmitEvent(e) {
          if (this.stopSubmit) {
              e.preventDefault();
              this.removeStorage();
              this.writeStorage();
              this.stopSubmit = false;
              this.newsletter.submit();
          }
      }
      checkForChallengePage() {
          this.isChallengePage = window.location.pathname === '/challenge';
      }
      writeStorage() {
          if (this.sessionStorage !== undefined) {
              this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
          }
      }
      readStorage() {
          this.formID = this.sessionStorage.getItem('newsletter_form_id');
      }
      removeStorage() {
          this.sessionStorage.removeItem('newsletter_form_id');
      }
      showMessage() {
          this.readStorage();
          if (this.newsletter.id === this.formID) {
              const newsletter = document.getElementById(this.formID);
              if (window.location.search.indexOf('?customer_posted=true') !== -1) {
                  newsletter.classList.remove(classes$2.error);
                  newsletter.classList.add(classes$2.success);
              } else if (window.location.search.indexOf('accepts_marketing') !== -1) {
                  newsletter.classList.remove(classes$2.success);
                  newsletter.classList.add(classes$2.error);
              }
              this.scrollToForm(newsletter);
          }
      }
      scrollToForm(newsletter) {
          const rect = newsletter.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
          if (!isVisible) {
              setTimeout(()=>{
                  window.scroll({
                      top: rect.top,
                      left: 0,
                      behavior: 'smooth'
                  });
              }, 400);
          }
      }
      unload() {
          this.newsletter.removeEventListener('submit', this.newsletterSubmit);
      }
      constructor(newsletter){
          this.sessionStorage = window.sessionStorage;
          this.newsletter = newsletter;
          this.stopSubmit = true;
          this.isChallengePage = false;
          this.formID = null;
          this.checkForChallengePage();
          this.newsletterSubmit = (e)=>this.newsletterSubmitEvent(e)
          ;
          if (!this.isChallengePage) {
              this.init();
          }
      }
  };
  const newsletterCheckForResultSection = {
      onLoad () {
          sections$2[this.id] = [];
          const newsletters = this.container.querySelectorAll(selectors$2.newsletterForm);
          newsletters.forEach((form)=>{
              sections$2[this.id].push(new NewsletterCheckForResult(form));
          });
      },
      onUnload () {
          sections$2[this.id].forEach((form)=>{
              if (typeof form.unload === 'function') {
                  form.unload();
              }
          });
      }
  };

  const selectors$1 = {
      tracking: '[data-tracking-consent]',
      trackingAccept: '[data-confirm-cookies]',
      close: '[data-close-modal]',
      popupInner: '[data-popup-inner]',
      newsletterPopup: '[data-newsletter]',
      newsletterPopupHolder: '[data-newsletter-holder]',
      newsletterField: '[data-newsletter-field]',
      newsletterForm: '[data-newsletter-form]',
      promoPopup: '[data-promo-text]',
      delayAttribite: 'data-popup-delay',
      cookieNameAttribute: 'data-cookie-name',
      dataTargetReferrer: 'data-target-referrer'
  };
  const classes$1 = {
      hide: 'hide',
      hasValue: 'has-value',
      success: 'has-success',
      desktop: 'desktop',
      mobile: 'mobile'
  };
  let sections$1 = {};
  let PopupCookie = class PopupCookie {
      write() {
          const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row)=>row.startsWith(this.name)
          );
          if (hasCookie || document.cookie.indexOf('; ') === -1) {
              document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
          }
      }
      read() {
          if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row)=>row.startsWith(this.name)
          )) {
              const returnCookie = document.cookie.split('; ').find((row)=>row.startsWith(this.name)
              ).split('=')[1];
              return returnCookie;
          } else return false;
      }
      destroy() {
          if (document.cookie.split('; ').find((row)=>row.startsWith(this.name)
          )) {
              document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
          }
      }
      constructor(name, value){
          this.configuration = {
              expires: null,
              path: '/',
              domain: window.location.hostname
          };
          this.name = name;
          this.value = value;
      }
  };
  let DelayShow = class DelayShow {
      always() {
          fadeIn(this.element);
      }
      delayed() {
          // Show popup after 10s
          setTimeout(()=>{
              fadeIn(this.element);
          }, 10000);
      }
      // Scroll to the bottom of the page
      bottom() {
          window.addEventListener('scroll', ()=>{
              if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
                  fadeIn(this.element);
              }
          });
      }
      // Idle for 1 min
      idle() {
          let timer = 0;
          let idleTime = 60000;
          const documentEvents = [
              'mousemove',
              'mousedown',
              'click',
              'touchmove',
              'touchstart',
              'touchend',
              'keydown',
              'keypress'
          ];
          const windowEvents = [
              'load',
              'resize',
              'scroll'
          ];
          const startTimer = ()=>{
              timer = setTimeout(()=>{
                  timer = 0;
                  fadeIn(this.element);
              }, idleTime);
              documentEvents.forEach((eventType)=>{
                  document.addEventListener(eventType, resetTimer);
              });
              windowEvents.forEach((eventType)=>{
                  window.addEventListener(eventType, resetTimer);
              });
          };
          const resetTimer = ()=>{
              if (timer) {
                  clearTimeout(timer);
              }
              documentEvents.forEach((eventType)=>{
                  document.removeEventListener(eventType, resetTimer);
              });
              windowEvents.forEach((eventType)=>{
                  window.removeEventListener(eventType, resetTimer);
              });
              startTimer();
          };
          startTimer();
      }
      constructor(holder, element){
          this.element = element;
          this.delay = holder.getAttribute(selectors$1.delayAttribite);
          if (this.delay === 'always') {
              this.always();
          }
          if (this.delay === 'delayed') {
              this.delayed();
          }
          if (this.delay === 'bottom') {
              this.bottom();
          }
          if (this.delay === 'idle') {
              this.idle();
          }
      }
  };
  let TargetReferrer = class TargetReferrer {
      init() {
          if (this.locationPath.indexOf(this.el.getAttribute(selectors$1.dataTargetReferrer)) === -1) {
              this.el.parentNode.removeChild(this.el);
          }
      }
      constructor(el){
          this.el = el;
          this.locationPath = location.href;
          if (!this.el.hasAttribute(selectors$1.dataTargetReferrer)) {
              return;
          }
          this.init();
      }
  };
  let Tracking = class Tracking {
      init() {
          if (this.showPopup) {
              fadeIn(this.modalInner);
          }
          this.clickEvents();
      }
      clickEvents() {
          this.close.addEventListener('click', (event)=>{
              event.preventDefault();
              window.Shopify.customerPrivacy.setTrackingConsent(false, ()=>fadeOut(this.modalInner)
              );
          });
          this.acceptButton.addEventListener('click', (event)=>{
              event.preventDefault();
              window.Shopify.customerPrivacy.setTrackingConsent(true, ()=>fadeOut(this.modalInner)
              );
          });
          document.addEventListener('trackingConsentAccepted', function() {
              console.log('trackingConsentAccepted event fired');
          });
      }
      onBlockSelect(evt) {
          if (this.popup.contains(evt.target)) {
              setTimeout(()=>{
                  fadeIn(this.modalInner);
              }, 400);
          }
      }
      onBlockDeselect(evt) {
          if (this.popup.contains(evt.target)) {
              fadeOut(this.modalInner);
          }
      }
      constructor(el){
          this.popup = el;
          this.modal = document.querySelector(selectors$1.tracking);
          this.modalInner = this.popup.querySelector(selectors$1.popupInner);
          this.close = this.modal.querySelector(selectors$1.close);
          this.acceptButton = this.modal.querySelector(selectors$1.trackingAccept);
          this.enable = this.modal.getAttribute('data-enable') === 'true';
          this.showPopup = false;
          window.Shopify.loadFeatures([
              {
                  name: 'consent-tracking-api',
                  version: '0.1'
              }, 
          ], (error)=>{
              if (error) {
                  throw error;
              }
              const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked();
              const userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();
              this.showPopup = !userCanBeTracked && userTrackingConsent === 'no_interaction' && this.enable;
              if (window.Shopify.designMode) {
                  this.showPopup = false;
                  fadeOut(this.modalInner);
              }
              this.init();
          });
      }
  };
  let PromoText = class PromoText {
      init() {
          const cookieExists = this.cookie.read() !== false;
          if (!cookieExists || window.Shopify.designMode) {
              if (!window.Shopify.designMode) {
                  new DelayShow(this.popup, this.popupInner);
              }
              this.clickEvents();
          }
      }
      clickEvents() {
          this.close.addEventListener('click', (event)=>{
              event.preventDefault();
              fadeOut(this.popupInner);
              this.cookie.write();
          });
      }
      onBlockSelect(evt) {
          if (this.popup.classList.contains(classes$1.mobile)) {
              this.hasDeviceClass = classes$1.mobile;
          }
          if (this.popup.classList.contains(classes$1.desktop)) {
              this.hasDeviceClass = classes$1.desktop;
          }
          if (this.hasDeviceClass !== '') {
              this.popup.classList.remove(this.hasDeviceClass);
          }
          if (this.popup.contains(evt.target)) {
              setTimeout(()=>{
                  fadeIn(this.popupInner);
              }, 400);
          }
      }
      onBlockDeselect(evt) {
          if (this.popup.contains(evt.target)) {
              fadeOut(this.popupInner);
          }
          if (this.hasDeviceClass !== '') {
              this.popup.classList.add(this.hasDeviceClass);
          }
      }
      constructor(el){
          this.popup = el;
          this.popupInner = this.popup.querySelector(selectors$1.popupInner);
          this.close = this.popup.querySelector(selectors$1.close);
          this.cookie = new PopupCookie(this.popup.getAttribute(selectors$1.cookieNameAttribute), 'user_has_closed');
          this.isTargeted = new TargetReferrer(this.popup);
          this.hasDeviceClass = '';
          this.init();
      }
  };
  let NewsletterPopup = class NewsletterPopup {
      init() {
          const cookieExists = this.cookie.read() !== false;
          if (!cookieExists || window.Shopify.designMode) {
              this.show();
              if (this.form.classList.contains(classes$1.success)) {
                  this.checkForSuccess();
              }
          }
      }
      show() {
          if (!window.Shopify.designMode) {
              new DelayShow(this.popup, this.popupInner);
          }
          this.inputField();
          this.closePopup();
      }
      checkForSuccess() {
          fadeIn(this.popupInner);
          this.cookie.write();
      }
      closePopup() {
          this.close.addEventListener('click', (event)=>{
              event.preventDefault();
              fadeOut(this.popupInner);
              this.cookie.write();
          });
      }
      inputField() {
          this.newsletterField.addEventListener('input', ()=>{
              if (this.newsletterField.value !== '') {
                  this.holder.classList.add(classes$1.hasValue, this.newsletterField.value !== '');
              }
          });
          this.newsletterField.addEventListener('focus', ()=>{
              if (this.newsletterField.value !== '') {
                  this.holder.classList.add(classes$1.hasValue, this.newsletterField.value !== '');
              }
          });
          this.newsletterField.addEventListener('focusout', ()=>{
              setTimeout(()=>{
                  this.holder.classList.remove(classes$1.hasValue);
              }, 2000);
          });
      }
      onBlockSelect(evt) {
          if (this.popup.classList.contains(classes$1.mobile)) {
              this.hasDeviceClass = classes$1.mobile;
          }
          if (this.popup.classList.contains(classes$1.desktop)) {
              this.hasDeviceClass = classes$1.desktop;
          }
          if (this.hasDeviceClass !== '') {
              this.popup.classList.remove(this.hasDeviceClass);
          }
          if (this.popup.contains(evt.target)) {
              setTimeout(()=>{
                  fadeIn(this.popupInner);
              }, 400);
          }
      }
      onBlockDeselect(evt) {
          if (this.popup.contains(evt.target)) {
              fadeOut(this.popupInner);
          }
          if (this.hasDeviceClass !== '') {
              this.popup.classList.add(this.hasDeviceClass);
          }
      }
      constructor(el){
          this.popup = el;
          this.popupInner = this.popup.querySelector(selectors$1.popupInner);
          this.holder = this.popup.querySelector(selectors$1.newsletterPopupHolder);
          this.close = this.popup.querySelector(selectors$1.close);
          this.newsletterField = this.popup.querySelector(selectors$1.newsletterField);
          this.cookie = new PopupCookie(this.popup.getAttribute(selectors$1.cookieNameAttribute), 'newsletter_is_closed');
          this.form = this.popup.querySelector(selectors$1.newsletterForm);
          this.isTargeted = new TargetReferrer(this.popup);
          this.hasDeviceClass = '';
          this.init();
      }
  };
  const popupSection = {
      onLoad () {
          sections$1[this.id] = [];
          const tracking = this.container.querySelectorAll(selectors$1.tracking);
          tracking.forEach((el)=>{
              sections$1[this.id].push(new Tracking(el));
          });
          const newsletterPopup = this.container.querySelectorAll(selectors$1.newsletterPopup);
          newsletterPopup.forEach((el)=>{
              sections$1[this.id].push(new NewsletterPopup(el));
          });
          const promoPopup = this.container.querySelectorAll(selectors$1.promoPopup);
          promoPopup.forEach((el)=>{
              sections$1[this.id].push(new PromoText(el));
          });
      },
      onBlockSelect (evt) {
          sections$1[this.id].forEach((el)=>{
              if (typeof el.onBlockSelect === 'function') {
                  el.onBlockSelect(evt);
              }
          });
      },
      onBlockDeselect (evt) {
          sections$1[this.id].forEach((el)=>{
              if (typeof el.onBlockDeselect === 'function') {
                  el.onBlockDeselect(evt);
              }
          });
      }
  };
  register('popups', [
      popupSection,
      newsletterCheckForResultSection
  ]);

  register('newsletter', [
      newsletterCheckForResultSection
  ]);

  register('section-icons', [
      slider,
      blockScroll
  ]);

  const sections = {};
  const selectors = {
      logo: '[data-slider-logo]',
      text: '[data-slider-text]',
      slide: 'data-slide',
      slideIndex: 'data-slide-index'
  };
  const classes = {
      flickityEnabled: 'flickity-enabled',
      isSelected: 'is-selected'
  };
  const variables = {
      slideNavWidth: 200
  };
  let Press = class Press {
      init() {
          this.flkty = new FlickityFade(this.slideshowText, {
              fade: true,
              autoPlay: false,
              prevNextButtons: false,
              cellAlign: 'left',
              contain: true,
              pageDots: false,
              wrapAround: false,
              selectedAttraction: 0.2,
              friction: 0.6,
              draggable: false
          });
          this.clickSliderNavEvents();
          this.initSliderNav();
      }
      calculateMarginTextSlides() {
          const textSlides = this.slideshowText.querySelectorAll(`[${selectors.slide}]`);
          if (textSlides.length) {
              const maxHeight = Math.max.apply(null, [
                  ...textSlides
              ].map((element)=>{
                  const height = element.clientHeight || element.offsetHeight;
                  return height;
              }));
              textSlides.forEach((element)=>{
                  const elementHeight = element.clientHeight || element.offsetHeight;
                  if (elementHeight < maxHeight) {
                      const calculateMargin = Math.ceil((maxHeight - elementHeight) / 2);
                      element.style.margin = `${calculateMargin}px 0`;
                  }
              });
          }
      }
      initSliderNav() {
          this.activeSliderNav();
          this.setDefaultStatesOnSliderNav();
          this.calculateMarginTextSlides();
          window.addEventListener('resize', this.resizeEvent);
      }
      setDefaultStatesOnSliderNav() {
          const selectedSlide = this.sliderNav.querySelector(`.${classes.isSelected}`);
          if (selectedSlide) {
              selectedSlide.classList.remove(classes.isSelected);
              this.logoSlides[0].classList.add(classes.isSelected);
          }
          if (this.sliderNavAvailable) {
              if (this.flktyNav === null) {
                  this.flktyNav = new Flickity(this.sliderNav, {
                      prevNextButtons: false,
                      contain: true,
                      pageDots: false,
                      wrapAround: true,
                      watchCSS: true,
                      selectedAttraction: 0.05,
                      friction: 0.8,
                      initialIndex: 0,
                      freeScroll: true
                  });
                  if (this.flktyNav) {
                      this.flkty.select(0);
                      this.flktyNav.on('change', (index)=>this.flkty.select(index)
                      );
                      this.flktyNav.resize();
                  }
              }
          } else {
              if (this.flktyNav !== null) {
                  this.flktyNav.destroy();
                  this.flktyNav = null;
              }
              this.logoSlides[0].classList.add(classes.isSelected);
              if (this.flkty) {
                  this.flkty.select(0);
              }
          }
      }
      clickSliderNavEvents() {
          this.logoSlides.forEach((slide)=>{
              slide.addEventListener('click', (e)=>{
                  const currentTarget = e.currentTarget;
                  const selectedIndex = Number(currentTarget.getAttribute(selectors.slideIndex));
                  const hasSlider = this.sliderNav.classList.contains(classes.flickityEnabled);
                  if (this.flkty) {
                      this.flkty.select(selectedIndex);
                  }
                  if (hasSlider) {
                      this.flktyNav.select(selectedIndex);
                  }
                  if (!hasSlider) {
                      const selectedSlide = this.sliderNav.querySelector(`.${classes.isSelected}`);
                      if (selectedSlide) {
                          selectedSlide.classList.remove(classes.isSelected);
                      }
                      currentTarget.classList.add(classes.isSelected);
                  }
              });
          });
      }
      activeSliderNav() {
          const slidesCount = this.sliderNav.querySelectorAll(`[${selectors.slide}]`).length;
          const parentWidth = this.sliderNav.parentNode.offsetWidth || this.sliderNav.parentNode.clientWidth;
          const slidesWidth = slidesCount * variables.slideNavWidth;
          this.sliderNavAvailable = slidesWidth > parentWidth;
      }
      onUnload() {
          if (this.flktyNav) {
              this.flktyNav.destroy();
          }
          if (this.flkty) {
              this.flkty.destroy();
          }
          window.removeEventListener('resize', this.resizeEvent);
      }
      onBlockSelect(e) {
          if (!this.sliderNav) return;
          const selectedSlide = this.sliderNav.querySelector(`[${selectors.slide}="${e.detail.blockId}"]`);
          const slideIndex = parseInt(selectedSlide.getAttribute(selectors.slideIndex));
          this.calculateMarginTextSlides();
          if (this.flkty) {
              this.flkty.select(slideIndex);
          }
          if (this.sliderNav.classList.contains(classes.isSelected)) {
              this.sliderNav.classList.add(classes.isSelected);
              this.sliderNav.select(slideIndex);
          } else {
              selectedSlide.dispatchEvent(new Event('click'));
          }
      }
      onSelect() {
          window.removeEventListener('resize', this.resizeEvent);
          this.initSliderNav();
      }
      constructor(section){
          this.container = section.container;
          this.sliderNav = this.container.querySelector(selectors.logo);
          this.slideshowText = this.container.querySelector(selectors.text);
          this.flkty = null;
          this.flktyNav = null;
          if (this.sliderNav && this.slideshowText) {
              this.logoSlides = this.sliderNav.querySelectorAll(`[${selectors.slide}]`);
              this.resizeEvent = debounce(()=>this.initSliderNav()
              , 500);
              this.init();
          }
      }
  };
  const press = {
      onLoad () {
          sections[this.id] = new Press(this);
      },
      onUnload (e) {
          sections[this.id].onUnload(e);
      },
      onSelect () {
          if (this.type === 'press') {
              sections[this.id].onSelect();
          }
      },
      onBlockSelect (e) {
          sections[this.id].onBlockSelect(e);
      }
  };
  register('press', [
      press,
      blockScroll
  ]);

  register('logo-list', [
      customScrollbar,
      blockScroll
  ]);

  const wrap = (toWrap, wrapperClass = '', wrapper)=>{
      wrapper = wrapper || document.createElement('div');
      wrapper.classList.add(wrapperClass);
      toWrap.parentNode.insertBefore(wrapper, toWrap);
      return wrapper.appendChild(toWrap);
  };

  const loaders = {};
  function loadScript(options = {}) {
      if (!options.type) {
          options.type = 'json';
      }
      if (options.url) {
          if (loaders[options.url]) {
              return loaders[options.url];
          } else {
              return getScriptWithPromise(options.url, options.type);
          }
      } else if (options.json) {
          if (loaders[options.json]) {
              return Promise.resolve(loaders[options.json]);
          } else {
              return window.fetch(options.json).then((response)=>{
                  return response.json();
              }).then((response)=>{
                  loaders[options.json] = response;
                  return response;
              });
          }
      } else if (options.name) {
          const key = ''.concat(options.name, options.version);
          if (loaders[key]) {
              return loaders[key];
          } else {
              return loadShopifyWithPromise(options);
          }
      } else {
          return Promise.reject();
      }
  }function getScriptWithPromise(url, type) {
      const loader = new Promise((resolve, reject)=>{
          if (type === 'text') {
              fetch(url).then((response)=>response.text()
              ).then((data)=>{
                  resolve(data);
              }).catch((error)=>{
                  reject(error);
              });
          } else {
              getScript(url, function() {
                  resolve();
              }, function() {
                  reject();
              });
          }
      });
      loaders[url] = loader;
      return loader;
  }
  function loadShopifyWithPromise(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject)=>{
          try {
              window.Shopify.loadFeatures([
                  {
                      name: options.name,
                      version: options.version,
                      onLoad: (err)=>{
                          onLoadFromShopify(resolve, reject, err);
                      }
                  }, 
              ]);
          } catch (err) {
              reject(err);
          }
      });
      loaders[key] = loader;
      return loader;
  }
  function onLoadFromShopify(resolve, reject, err) {
      if (err) {
          return reject(err);
      } else {
          return resolve();
      }
  }

  document.addEventListener('DOMContentLoaded', function() {
      // Load all registered sections on the page.
      load('*');
      // Target tables to make them scrollable
      const tableSelectors = '.rte table';
      const tables = document.querySelectorAll(tableSelectors);
      tables.forEach((table)=>{
          wrap(table, 'rte__table-wrapper');
      });
      // Target iframes to make them responsive
      const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
      const frames = document.querySelectorAll(iframeSelectors);
      frames.forEach((frame)=>{
          wrap(frame, 'rte__video-wrapper');
      });
      document.addEventListener('mousedown', ()=>{
          document.body.classList.remove('focus-enabled');
      });
      document.addEventListener('keyup', (event)=>{
          if (event.keyCode === 9) {
              document.body.classList.add('focus-enabled');
          }
      });
      // Apply a specific class to the html element for browser support of cookies.
      if (window.navigator.cookieEnabled) {
          document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
      }
      // Common a11y fixes
      focusHash();
      bindInPageLinks();
      let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
      if (!hasNativeSmoothScroll) {
          loadScript({
              url: window.theme.assets.smoothscroll
          });
      }
  });

}(themeVendor.BodyScrollLock, themeVendor.FlickityFade, themeVendor.themeCurrency, themeVendor.themeAddresses, themeVendor.Sqrl, themeVendor.axios, themeVendor.MicroModal, themeVendor.Flickity, themeVendor.Rellax, themeVendor.FlickitySync));
//# sourceMappingURL=theme.js.map
