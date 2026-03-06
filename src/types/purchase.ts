export interface Purchase {
    id: number;
    user_id: number;
    date: string; // data da compra
    item: string; // nome do item comprado
    price: number; // preço do item em dinheiro
    hours_used: number; // horas consumidas do saldo
    created_at: string;
}