import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../frontend/src/app/App.jsx';
import { AuthProvider } from '../frontend/src/modules/auth/context/AuthContext.jsx';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/home',
});

const { window } = dom;

Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  requestAnimationFrame: window.requestAnimationFrame ?? ((cb) => setTimeout(cb, 0)),
  cancelAnimationFrame: window.cancelAnimationFrame ?? ((id) => clearTimeout(id)),
});

globalThis.getComputedStyle = window.getComputedStyle;

const container = window.document.getElementById('root');
const root = createRoot(container);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNavLinkByLabel(label) {
  const links = Array.from(window.document.querySelectorAll('a.nav-items'));
  return links.find((link) => link.textContent?.trim() === label);
}

function clickLink(element) {
  if (!element) throw new Error(`Link not found: ${element}`);
  const event = new window.MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  element.dispatchEvent(event);
}

await act(async () => {
  root.render(
    <MemoryRouter initialEntries={['/home']}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
});

await wait(500);

const categoriesLink = getNavLinkByLabel('Categorías');
clickLink(categoriesLink);
await wait(400);

const categoriesText = window.document.body.textContent.includes('Encuentra lo que buscas');
console.log('After clicking Categorías:', { categoriesText });

const homeLink = getNavLinkByLabel('Inicio');
clickLink(homeLink);
await wait(400);
const homeText = window.document.body.textContent.includes('Coordinemos una visita');
console.log('After clicking Inicio:', { homeText });

const productsLink = getNavLinkByLabel('Productos');
clickLink(productsLink);
await wait(400);
const productsText = window.document.body.textContent.includes('Filtros');
console.log('After clicking Productos:', { productsText });

root.unmount();
