const tenantService = require('@services/tenant')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')
const Tenant = require('@controllers/tenant')

jest.mock('@services/tenant')
jest.mock('@generics/utils')
jest.mock('@helpers/responses')

describe('Tenant controller (Jest)', () => {
	let tenantController
	let req

	const mockFailureResponse = jest.fn((payload) => ({ ...payload }))

	beforeEach(() => {
		tenantController = new Tenant()
		req = {
			params: {},
			body: {},
			headers: {},
			decodedToken: {},
		}

		responses.failureResponse.mockImplementation(mockFailureResponse)

		jest.clearAllMocks()
	})

	describe('update', () => {
		it('updates tenant when id is present in params', async () => {
			const mockTenant = { id: 'tenant-1' }
			req.params.id = 'tenant-1'
			req.body = { name: 'Tenant Name' }
			req.decodedToken.id = 'user-123'
			tenantService.update.mockResolvedValue(mockTenant)

			const result = await tenantController.update(req)

			expect(tenantService.update).toHaveBeenCalledWith('tenant-1', { name: 'Tenant Name' }, 'user-123')
			expect(tenantService.create).not.toHaveBeenCalled()
			expect(result).toEqual(mockTenant)
		})

		it('creates tenant when id is absent and domains provided', async () => {
			const mockTenant = { id: 'tenant-2' }
			req.body = { name: 'New Tenant', domains: ['tenant.org'] }
			req.decodedToken.id = 'creator-456'
			tenantService.create.mockResolvedValue(mockTenant)

			const result = await tenantController.update(req)

			expect(tenantService.create).toHaveBeenCalledWith(
				{ name: 'New Tenant', domains: ['tenant.org'] },
				'creator-456',
				['tenant.org']
			)
			expect(tenantService.update).not.toHaveBeenCalled()
			expect(result).toEqual(mockTenant)
		})

		it('returns error when service throws', async () => {
			const mockError = new Error('update failed')
			req.params.id = 'tenant-3'
			req.decodedToken.id = 'user-789'
			tenantService.update.mockRejectedValue(mockError)

			const result = await tenantController.update(req)

			expect(result).toBe(mockError)
		})
	})

	describe('addDomain', () => {
		it('adds domains to tenant', async () => {
			const mockResult = { success: true }
			req.params.id = 'tenant-1'
			req.body.domains = ['example.com']
			tenantService.addDomain.mockResolvedValue(mockResult)

			const result = await tenantController.addDomain(req)

			expect(tenantService.addDomain).toHaveBeenCalledWith('tenant-1', ['example.com'])
			expect(result).toEqual(mockResult)
		})

		it('returns error when service throws', async () => {
			const mockError = new Error('add domain error')
			req.params.id = 'tenant-1'
			req.body.domains = ['fail.com']
			tenantService.addDomain.mockRejectedValue(mockError)

			const result = await tenantController.addDomain(req)

			expect(result).toBe(mockError)
		})
	})

	describe('removeDomain', () => {
		it('removes domains with decoded token id', async () => {
			const mockResult = { removed: true }
			req.params.id = 'tenant-1'
			req.body.domains = ['remove.com']
			req.decodedToken.id = 'user-123'
			tenantService.removeDomain.mockResolvedValue(mockResult)

			const result = await tenantController.removeDomain(req)

			expect(tenantService.removeDomain).toHaveBeenCalledWith('tenant-1', ['remove.com'], 'user-123')
			expect(result).toEqual(mockResult)
		})

		it('returns error when service throws', async () => {
			const mockError = new Error('remove domain error')
			req.params.id = 'tenant-1'
			req.body.domains = ['fail.com']
			req.decodedToken.id = 'user-123'
			tenantService.removeDomain.mockRejectedValue(mockError)

			const result = await tenantController.removeDomain(req)

			expect(result).toBe(mockError)
		})
	})

	describe('read', () => {
		beforeEach(() => {
			utilsHelper.validateRoleAccess.mockReturnValue(true)
		})

		it('returns failure when roles are missing', async () => {
			req.decodedToken.roles = null

			const result = await tenantController.read(req)

			expect(responses.failureResponse).toHaveBeenCalledWith({
				statusCode: httpStatusCode.bad_request,
				message: 'PERMISSION_DENIED',
				result: {},
			})
			expect(result).toEqual({
				statusCode: httpStatusCode.bad_request,
				message: 'PERMISSION_DENIED',
				result: {},
			})
			expect(tenantService.read).not.toHaveBeenCalled()
		})

		it('returns failure when non-admin asks for different tenant', async () => {
			req.decodedToken.roles = ['USER']
			req.decodedToken.tenant_code = 'tenant-123'
			req.params.id = 'tenant-other'
			utilsHelper.validateRoleAccess.mockReturnValue(false)

			const result = await tenantController.read(req)

			expect(utilsHelper.validateRoleAccess).toHaveBeenCalledWith(['USER'], common.ADMIN_ROLE)
			expect(responses.failureResponse).toHaveBeenCalledWith({
				statusCode: httpStatusCode.bad_request,
				message: 'PERMISSION_DENIED',
				result: {},
			})
			expect(result).toEqual({
				statusCode: httpStatusCode.bad_request,
				message: 'PERMISSION_DENIED',
				result: {},
			})
			expect(tenantService.read).not.toHaveBeenCalled()
		})

		it('normal user reads own tenant', async () => {
			const mockTenant = { id: 'tenant-123' }
			req.decodedToken.roles = ['USER']
			req.decodedToken.tenant_code = 'tenant-123'
			utilsHelper.validateRoleAccess.mockReturnValue(false)
			tenantService.read.mockResolvedValue(mockTenant)

			const result = await tenantController.read(req)

			expect(utilsHelper.validateRoleAccess).toHaveBeenCalledWith(['USER'], common.ADMIN_ROLE)
			expect(tenantService.read).toHaveBeenCalledWith('tenant-123', false)
			expect(result).toEqual(mockTenant)
		})

		it('admin reads requested tenant id', async () => {
			const mockTenant = { id: 'tenant-999' }
			req.decodedToken.roles = ['ADMIN']
			req.decodedToken.tenant_code = 'tenant-123'
			req.params.id = 'tenant-999'
			utilsHelper.validateRoleAccess.mockReturnValue(true)
			tenantService.read.mockResolvedValue(mockTenant)

			const result = await tenantController.read(req)

			expect(utilsHelper.validateRoleAccess).toHaveBeenCalledWith(['ADMIN'], common.ADMIN_ROLE)
			expect(tenantService.read).toHaveBeenCalledWith('tenant-999', true)
			expect(result).toEqual(mockTenant)
		})

		it('admin defaults to undefined code when param missing', async () => {
			const mockTenant = { id: 'tenant-default' }
			req.decodedToken.roles = ['ADMIN']
			utilsHelper.validateRoleAccess.mockReturnValue(true)
			tenantService.read.mockResolvedValue(mockTenant)

			const result = await tenantController.read(req)

			expect(tenantService.read).toHaveBeenCalledWith(undefined, true)
			expect(result).toEqual(mockTenant)
		})

		it('returns error when service fails', async () => {
			const mockError = new Error('read failed')
			req.decodedToken.roles = ['ADMIN']
			utilsHelper.validateRoleAccess.mockReturnValue(true)
			tenantService.read.mockRejectedValue(mockError)

			const result = await tenantController.read(req)

			expect(result).toBe(mockError)
		})
	})

	describe('list', () => {
		it('lists tenants with pagination params', async () => {
			const mockList = [{ id: 'tenant-1' }]
			req.pageNo = 1
			req.pageSize = 10
			req.searchText = 'abc'

			tenantService.list.mockResolvedValue(mockList)

			const result = await tenantController.list(req)

			expect(tenantService.list).toHaveBeenCalledWith(1, 10, 'abc')
			expect(result).toEqual(mockList)
		})

		it('returns error when list fails', async () => {
			const mockError = new Error('list error')
			tenantService.list.mockRejectedValue(mockError)

			const result = await tenantController.list(req)

			expect(result).toBe(mockError)
		})
	})

	describe('bulkUserCreate', () => {
		it('invokes userBulkUpload with uppercased upload type', async () => {
			const mockResult = { success: true }
			req.body = { file_path: '/tmp/users.csv', upload_type: 'csv', editable_fields: ['name'] }
			req.decodedToken.id = 'user-123'
			req.headers.organization = 'org-1'
			req.headers.tenant = 'tenant-1'

			tenantService.userBulkUpload.mockResolvedValue(mockResult)

			const result = await tenantController.bulkUserCreate(req)

			expect(tenantService.userBulkUpload).toHaveBeenCalledWith(
				'/tmp/users.csv',
				'user-123',
				'org-1',
				'tenant-1',
				['name'],
				'CSV'
			)
			expect(result).toEqual(mockResult)
		})

		it('handles missing optional fields gracefully', async () => {
			const mockResult = { success: true }
			req.body = { file_path: '/tmp/users.csv', upload_type: 'excel' }
			req.decodedToken.id = 'user-123'
			tenantService.userBulkUpload.mockResolvedValue(mockResult)

			const result = await tenantController.bulkUserCreate(req)

			expect(tenantService.userBulkUpload).toHaveBeenCalledWith(
				'/tmp/users.csv',
				'user-123',
				undefined,
				undefined,
				undefined,
				'EXCEL'
			)
			expect(result).toEqual(mockResult)
		})

		it('returns error when bulk upload fails', async () => {
			const mockError = new Error('upload failed')
			req.body = { file_path: '/tmp/users.csv', upload_type: 'csv' }
			req.decodedToken.id = 'user-123'
			tenantService.userBulkUpload.mockRejectedValue(mockError)

			const result = await tenantController.bulkUserCreate(req)

			expect(result).toBe(mockError)
		})
	})

	describe('readInternal', () => {
		it('returns failure when tenant code missing', async () => {
			req.params.id = undefined

			const result = await tenantController.readInternal(req)

			expect(responses.failureResponse).toHaveBeenCalledWith({
				statusCode: httpStatusCode.bad_request,
				message: 'TENANT_CODE_REQUIRED',
				result: {},
			})
			expect(result).toEqual({
				statusCode: httpStatusCode.bad_request,
				message: 'TENANT_CODE_REQUIRED',
				result: {},
			})
			expect(tenantService.read).not.toHaveBeenCalled()
		})

		it('reads tenant with admin flag true', async () => {
			const mockTenant = { id: 'tenant-xyz' }
			req.params.id = 'tenant-xyz'
			tenantService.read.mockResolvedValue(mockTenant)

			const result = await tenantController.readInternal(req)

			expect(tenantService.read).toHaveBeenCalledWith('tenant-xyz', true)
			expect(result).toEqual(mockTenant)
		})

		it('returns error when service throws', async () => {
			const mockError = new Error('internal read error')
			req.params.id = 'tenant-xyz'
			tenantService.read.mockRejectedValue(mockError)

			const result = await tenantController.readInternal(req)

			expect(result).toBe(mockError)
		})
	})
})