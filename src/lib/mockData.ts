import type { Product, Category, User, Order } from './api'

export const mockCategories: Category[] = [
	{
		id: 'cat1',
		name: 'Electronics',
		description: 'Phones, laptops, and more',
		created_at: '',
		updated_at: '',
	},
	{
		id: 'cat2',
		name: 'Clothing',
		description: 'Fashion and apparel',
		created_at: '',
		updated_at: '',
	},
]

export const mockProducts: Product[] = [
	{
		id: 'prod1',
		name: 'iPhone 15',
		description: 'Latest Apple smartphone',
		price: 999,
		stock_quantity: 10,
		category_id: 'cat1',
		created_at: '',
		updated_at: '',
		category: mockCategories[0],
	},
	{
		id: 'prod2',
		name: 'T-Shirt',
		description: '100% cotton',
		price: 19.99,
		stock_quantity: 50,
		category_id: 'cat2',
		created_at: '',
		updated_at: '',
		category: mockCategories[1],
	},
]

export const mockUser: User = {
	id: 'user1',
	email: 'test@example.com',
	first_name: 'Test',
	last_name: 'User',
	is_active: true,
	created_at: '',
	updated_at: '',
}

export const mockOrders: Order[] = [
	{
		id: 'order1',
		user_id: 'user1',
		status: 'pending',
		total_amount: 1018.99,
		shipping_address: '123 Main St',
		created_at: '',
		updated_at: '',
		items: [
			{
				id: 'oi1',
				order_id: 'order1',
				product_id: 'prod1',
				quantity: 1,
				price: 999,
				product: mockProducts[0],
			},
			{
				id: 'oi2',
				order_id: 'order1',
				product_id: 'prod2',
				quantity: 1,
				price: 19.99,
				product: mockProducts[1],
			},
		],
	},
]
