import { createDom } from "./didact/dom"
import { createElement } from "./didact/vdom"

let nextUnitOfWork = null

/**
 *
 * @param {object} element
 * @param {HTMLElement} container
 */
function render(element, container) {
	nextUnitOfWork = {
		dom: container,
		props: {
			children: [element],
		},
	}
}

/**
 * Performe une tâche et renvoie la suivante
 * @param fiber
 * @returns
 */
function performUnitOfWork(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	if (fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom)
	}

	const elements = fiber.props.children
	let index = 0
	let prevSibling = null

	while (index < elements.length) {
		const element = elements[index]

		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		}

		if (index === 0) {
			fiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber
		index++
	}
	console.log("fiber", fiber)

	if (fiber.child) {
		return fiber.child
	}

	let nextFiber = fiber
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling
		}
		nextFiber = nextFiber.parent
	}

	return null
}

function workLoop(deadline) {
	let shouldYield = false
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

window.Didact = {
	render,
	createElement,
}

export default Didact
