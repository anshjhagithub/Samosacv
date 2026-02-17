/**
 * Cart for placement toolkit: base resume_pdf + add-ons.
 * resume_pdf is always selected and cannot be deselected.
 */

import {
  type FeatureSlug,
  BASE_PRODUCT,
  ADDON_SLUGS,
  getPrice,
  getTotalRupees,
} from "./pricing";

export type CartState = Partial<Record<FeatureSlug, boolean>>;

const DEFAULT_CART: CartState = {
  [BASE_PRODUCT]: true,
};

export function getDefaultCart(): CartState {
  return { ...DEFAULT_CART };
}

export function addToCart(cart: CartState, slug: FeatureSlug): CartState {
  if (slug === BASE_PRODUCT) return cart;
  return { ...cart, [slug]: true };
}

export function removeFromCart(cart: CartState, slug: FeatureSlug): CartState {
  if (slug === BASE_PRODUCT) return cart;
  const next = { ...cart };
  delete next[slug];
  return next;
}

export function toggleCartItem(cart: CartState, slug: FeatureSlug): CartState {
  if (slug === BASE_PRODUCT) return cart;
  return { ...cart, [slug]: !cart[slug] };
}

export function isInCart(cart: CartState, slug: FeatureSlug): boolean {
  return slug === BASE_PRODUCT || !!cart[slug];
}

export function getCartTotal(cart: CartState): number {
  return getTotalRupees(cart);
}

export function getSelectedSlugs(cart: CartState): FeatureSlug[] {
  const out: FeatureSlug[] = [];
  if (cart[BASE_PRODUCT]) out.push(BASE_PRODUCT);
  for (const slug of ADDON_SLUGS) {
    if (cart[slug]) out.push(slug);
  }
  return out;
}

export function getAddonCount(cart: CartState): number {
  return ADDON_SLUGS.filter((s) => cart[s]).length;
}

export function getLineItemsForOrder(cart: CartState): Record<string, boolean> {
  const items: Record<string, boolean> = {};
  if (cart[BASE_PRODUCT]) items[BASE_PRODUCT] = true;
  for (const slug of ADDON_SLUGS) {
    if (cart[slug]) items[slug] = true;
  }
  return items;
}

export { getPrice, ADDON_SLUGS, BASE_PRODUCT };
