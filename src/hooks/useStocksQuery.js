import { useQuery } from '@tanstack/react-query';
import { stockService } from '../api/stockService';

// Hook để lấy tất cả stocks
export const useStocks = () => {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getAllStocks,
    refetchInterval: 30000, // Tự động refetch mỗi 30 giây
  });
};

// Hook để lấy chi tiết stock
export const useStockDetail = (symbol) => {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => stockService.getStockBySymbol(symbol),
    enabled: !!symbol, // Chỉ chạy khi có symbol
  });
};

// Hook để tìm kiếm stocks
export const useSearchStocks = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => stockService.searchStocks(query),
    enabled: query.length > 1, // Chỉ chạy khi có ít nhất 2 ký tự
  });
};