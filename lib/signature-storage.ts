// Signature storage utility using localStorage

const STORAGE_KEY = 'pdf-editor-signatures';

export interface StoredSignature {
    id: string;
    dataUrl: string;
    timestamp: number;
}

export const signatureStorage = {
    /**
     * Save a signature to localStorage
     */
    saveSignature(dataUrl: string): void {
        const signatures = this.getSignatures();

        // Check if signature already exists
        const exists = signatures.some(sig => sig.dataUrl === dataUrl);
        if (exists) {
            return;
        }

        const newSignature: StoredSignature = {
            id: `sig_${Date.now()}`,
            dataUrl,
            timestamp: Date.now(),
        };

        signatures.push(newSignature);

        // Keep only last 10 signatures
        if (signatures.length > 10) {
            signatures.shift();
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures));
        } catch (error) {
            console.error('Failed to save signature:', error);
        }
    },

    /**
     * Get all saved signatures
     */
    getSignatures(): StoredSignature[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return [];
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to load signatures:', error);
            return [];
        }
    },

    /**
     * Delete a specific signature by ID
     */
    deleteSignature(id: string): void {
        const signatures = this.getSignatures();
        const filtered = signatures.filter(sig => sig.id !== id);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Failed to delete signature:', error);
        }
    },

    /**
     * Clear all saved signatures
     */
    clearSignatures(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear signatures:', error);
        }
    },
};
