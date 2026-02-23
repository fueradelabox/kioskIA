import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/** Fetch the product catalog */
export function useProducts() {
    const products = useQuery(api.vendors.getProducts)
    return {
        products: products ?? [],
        loading: products === undefined,
    }
}

/** Find a product by barcode */
export function useFindProductByBarcode(barcode: string | null) {
    const data = useQuery(
        api.vendors.findProductByBarcode,
        barcode ? { barcode } : "skip"
    )
    return data ?? null
}

/** Process a POS payment */
export function useProcessPayment() {
    return useMutation(api.vendors.processPayment)
}

/** Add a quick product (fruit without barcode) */
export function useAddQuickProduct() {
    return useMutation(api.vendors.addQuickProduct)
}

/** Find a student by RUT (uses query — reactive) */
export function useFindStudentByRut(rut: string | null) {
    const data = useQuery(
        api.vendors.findStudentByRut,
        rut ? { rut } : "skip"
    )
    return data ?? null
}

/** Find a student by QR code */
export function useFindStudentByQR(qrCode: string | null) {
    const data = useQuery(
        api.vendors.findStudentByQR,
        qrCode ? { qrCode } : "skip"
    )
    return data ?? null
}

/** Get vendor sales dashboard data */
export function useVendorSales() {
    const data = useQuery(api.vendors.getVendorSales)
    return data ?? { sales: [], todayTotal: 0, todayCount: 0, todayHealthy: 0, todayUnhealthy: 0, todayLibrary: 0 }
}

/** Get vendor profile */
export function useVendorProfile() {
    return useQuery(api.vendors.getProfile)
}
