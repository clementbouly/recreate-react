export function createDom(fiber){
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