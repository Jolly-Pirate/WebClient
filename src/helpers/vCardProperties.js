import _ from 'lodash';
import vCard from 'vcf';

import { orderByPref } from './vcard';

/**
 * Check if a property is empty
 * @param {vCard.Property} property
 * @return {Boolean}
 */
const isEmpty = (property) => {
    if (Array.isArray(property)) {
        return property.filter(isEmpty).length;
    }

    if (property) {
        return property.isEmpty();
    }

    return true;
};

const canPushProp = (property, group) => {
    return !group || property.getGroup() === group;
};

/**
 * A property is considered as the same if it share the sale value and property with an other
 * @param {Array<vCard.Property>} properties
 * @return {Array}
 */
export const makeUniq = (properties = []) =>
    _.uniqBy(properties, (property) => {
        const type = property.getType();
        const value = property.valueOf();

        if (type) {
            return `${type} ${value}`;
        }

        return value;
    });

/**
 * Extract specific properties
 * @param {vCard} vcard
 * @param {Array} fields
 * @param {String} options.group
 * @return {Array} properties
 */
export function extract(vcard = new vCard(), fields = [], { group } = {}) {
    return fields.reduce((acc, key) => {
        const property = vcard.get(key);

        if (isEmpty(property)) {
            return acc;
        }

        const value = property.valueOf();

        if (Array.isArray(value)) {
            orderByPref(value).forEach((prop) => {
                canPushProp(prop, group) && acc.push(prop);
            });
            return acc;
        }

        canPushProp(property, group) && acc.push(property);
        return acc;
    }, []);
}

/**
 * Get all Properties for a specific vCard
 * @param  {vCard} vcard
 * @return {Array}
 */
export function extractAll(vcard = new vCard()) {
    return _.reduce(
        Object.keys(vcard.data),
        (acc, key) => {
            const value = vcard.get(key);
            const props = Array.isArray(value) ? value : [value];
            return acc.concat(props);
        },
        []
    );
}
