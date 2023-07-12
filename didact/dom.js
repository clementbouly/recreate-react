export function createDom(fiber) {
	const dom =
		fiber.type === "TEXT_ELEMENT"
			? document.createTextNode(fiber.props.nodeValue)
			: document.createElement(fiber.type)

	if (fiber.props) {
		Object.keys(fiber.props)
			.filter((key) => key !== "children")
			.forEach((name) => {
				dom[name] = fiber.props[name]
			})
	}

	return dom
}

const isEvent = (key) => key.startsWith("on")
const isProperty = (key) => key !== "children"
const eventName = (key) => key.toLowerCase().substring(2)

export function updateDom(dom, prevProps, nextProps) {
	// Supprime les anciennes propriétés
	Object.keys(prevProps)
		.filter(isProperty)
		.forEach((name) => {
			if (!(name in nextProps)) {
				if (isEvent(name)) {
					dom.removeEventListener(eventName(name), prevProps[name])
				} else {
					dom[name] = ""
				}
			}
		})

	// Ajoute les nouvelles propriétés
	Object.keys(nextProps)
		.filter(isProperty)
		.forEach((name) => {
			if (prevProps[name] !== nextProps[name]) {
				if (isEvent(name)) {
					if (prevProps[name]) {
						dom.removeEventListener(eventName(name), prevProps[name])
					}
					dom.addEventListener(eventName(name), nextProps[name])
				} else {
					dom[name] = nextProps[name]
				}
			}
		})
}
