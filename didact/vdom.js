/**
 *
 * @param {string} type
 * @param {object} props
 * @param  {...object|string} children
 */
export function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) => (typeof child === "object" ? child : createTextElement(child))),
		},
	}
}

export function createTextElement(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	}
}

