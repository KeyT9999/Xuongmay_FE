import api from './api.service';

export interface PayrollResult {
    factoryId: string;
    period: { startDate: string; endDate: string };
    totalPayroll: number;
    details: {
        date: string;
        moCode: string;
        styleId: string;
        operation: string;
        quantity: number;
        price: number;
        amount: number;
    }[];
}

export const accountingService = {
    calculatePayroll: async (factoryId: string, startDate: string, endDate: string): Promise<PayrollResult> => {
        const response = await api.get('/accounting/payroll', {
            params: { factoryId, startDate, endDate },
        });
        return response.data;
    },
};
