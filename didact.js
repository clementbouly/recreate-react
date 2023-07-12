import { createDom, updateDom } from "./didact/dom"
import { createElement } from "./didact/vdom"

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletions = []

/**
 * Ajoute la racine à l'arbre du DOM
 */
function commitRoot() {
	deletions.forEach(commitWork)
	commitWork(wipRoot.child)
	currentRoot = wipRoot
	wipRoot = null
}

function commitWork(fiber) {
	if (!fiber) {
		return
	}
	const domParent = fiber.parent.dom

	if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
		domParent.appendChild(fiber.dom)
	} else if (fiber.effectTag === "DELETION") {
		domParent.removeChild(fiber.dom)
		return
	} else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props)
	}

	commitWork(fiber.sibling)
	commitWork(fiber.child)
}

/**
 * Rend l'élement en l'ajoutant au dom
 * @param {object} element
 * @param {HTMLElement} container
 */
function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	}
	nextUnitOfWork = wipRoot
	deletions = []
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

	const elements = fiber.props.children
	reconcileChildren(fiber, elements)

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

function reconcileChildren(wipFiber, elements) {
	let index = 0
	let prevSibling = null
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child

	while (index < elements.length || oldFiber != null) {
		const element = elements[index]
		const sameType = oldFiber && element && element.type === oldFiber.type
		let newFiber = null

		if (sameType) {
			// TODO update the node
			newFiber = {
				type: element.type,
				props: element.props,
				parent: wipFiber,
				dom: oldFiber.dom,
				alternate: oldFiber,
				effectTag: "UPDATE",
			}
		}

		if (element && !sameType) {
			// TODO add this node
			newFiber = {
				type: element.type,
				props: element.props,
				parent: wipFiber,
				dom: null,
				alternate: null,
				effectTag: "PLACEMENT",
			}
		}

		if (oldFiber && !sameType) {
			// TODO delete the oldFiber's node
			oldFiber.effectTag = "DELETION"
			deletions.push(oldFiber)
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling
		}

		if (index === 0) {
			wipFiber.child = newFiber
		} else if (element) {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber
		index++
	}
}

function workLoop(deadline) {
	let shouldYield = false
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot()
	}

	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

window.Didact = {
	render,
	createElement,
}

export default Didact
