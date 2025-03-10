// burgerBTN

const burgerBtn = document.querySelector('.burgerBtn');
const burgerList = document.querySelector('.burgerList');
const liList = document.querySelectorAll('.burgerList_box li');

burgerBtn.addEventListener('click', () => {
	burgerList.classList.toggle('hidden');
});

liList.forEach((li) => {
	li.addEventListener('click', () => {
		burgerList.classList.add('hidden');
	});
});

//scrollspy

const menuItem = document.querySelectorAll('.links_info a');
const scrollSpySection = document.querySelectorAll('.section');

function handleScrollSpy() {
	if (document.body.classList.contains('mainPaige')) {
		const sections = [];

		scrollSpySection.forEach((section) => {
			if (window.scrollY <= section.offsetTop + section.offsetHeight) {
				sections.push(section);

				const activeSection = document.querySelector(
					`[href*="${sections[0].id}"]`
				);
				menuItem.forEach((item) => item.classList.remove('active'));

				activeSection.classList.add('active');
			}

			if (
				window.innerHeight + window.scrollY >=
				document.body.offsetHeight - 150
			) {
				const lastSection = document.querySelector(
					'.links_info a:last-of-type'
				);
				menuItem.forEach((item) => item.classList.remove('active'));

				lastSection.classList.add('active');
			}
		});
	}
}

window.addEventListener('scroll', handleScrollSpy);

// lazy loading

class ProductsProvider {
	constructor(
		params = { pageNumber: 1, pageSize: 20 },
		productsUrl = 'https://brandstestowy.smallhost.pl/api/random'
	) {
		this.productsUrl = productsUrl;
		this.params = params;
		this.hasMoreProductToProvide = true;
	}

	create(pageSize) {
		const pageNumber = Math.floor(
			(this.params.pageNumber * this.params.pageSize) / pageSize
		);

		return new ProductsProvider({
			pageNumber: pageNumber === 0 ? 1 : pageNumber,
			pageSize,
		});
	}

	async provide() {
		if (!this.hasMoreProductToProvide) {
			return {
				products: [],
			};
		}

		const { pageNumber, pageSize } = this.params;

		try {
			const res = await fetch(
				`${this.productsUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
			);

			if (!res.ok) {
				throw new Error(`Cannot get products: ${res.status}`);
			}

			const data = await res.json();

			this.hasMoreProductToProvide = data.totalPages > this.params.pageNumber;

			this.params.pageNumber++;

			return {
				products: data.data,
			};
		} catch (error) {
			console.error(error.message);
		}
	}
}

class ProductsRenderer {
	render(productsToRender) {
		const box = document.querySelector('#productsBox');
		for (let i = 0; i < productsToRender.length; i++) {
			if (box.children.namedItem(productsToRender[i].id)) {
				continue;
			}

			const img = document.createElement('img');

			img.id = productsToRender[i].id;
			img.src = productsToRender[i].image;
			img.alt = `Produkt nr ${productsToRender[i].text}`;
			img.addEventListener(
				'click',
				(function (productToRender) {
					return function () {
						openPopup(productToRender);
					};
				})(productsToRender[i])
			);

			box.appendChild(img);
		}
	}
}

function bindGlobalListeners() {
	window.addEventListener('scroll', debounce(handleScroll, 500));

	const productSelect = document.querySelector('#product-select');

	productSelect.addEventListener('change', (e) => {
		productProvider = productProvider.create(e.target.value);
	});
}

function debounce(func, wait) {
	let timeout;

	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);

		timeout = setTimeout(later, wait);
	};
}

const productRenderer = new ProductsRenderer();

let productProvider = new ProductsProvider();

async function handleScroll() {
	const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

	if (scrollTop + clientHeight >= scrollHeight - 150) {
		const { products } = await productProvider.provide();

		productRenderer.render(products);
	}
}

bindGlobalListeners();

// popup

const popup = document.querySelector('.popup');
const overlay = document.querySelector('.overlay');
const btnClosePopup = document.querySelector('.close-popup');
const id = document.querySelector('.paragraph-id');
const nameOfProduct = document.querySelector('.paragraph-name');

const openPopup = function (productToRender) {
	popup.classList.remove('hidden');
	overlay.classList.remove('hidden');

	id.textContent = productToRender.id;
	nameOfProduct.textContent = `Nazwa: ${productToRender.text}`;
};

const closePopup = function () {
	popup.classList.add('hidden');
	overlay.classList.add('hidden');
};

btnClosePopup.addEventListener('click', closePopup);
overlay.addEventListener('click', closePopup);
