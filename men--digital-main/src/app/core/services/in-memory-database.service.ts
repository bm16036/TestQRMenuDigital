import { Injectable, computed, signal } from '@angular/core';

import { Category } from '../models/category.model';
import { Company } from '../models/company.model';
import { Menu } from '../models/menu.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

/**
 * Contiene datos simulados para poder visualizar la interfaz
 * mientras el backend se implementa. Al conectar la API,
 * simplemente desactiva `useMockData` en el `environment`.
 */
@Injectable({ providedIn: 'root' })
export class InMemoryDatabaseService {
  private readonly companiesSignal = signal<Company[]>([
    {
      id: 'empresa-001',
      taxId: 'RUC-001',
      businessName: 'Restaurante S.A.',
      commercialName: 'Sabores del Mar',
      email: 'contacto@saboresdelmar.com',
      phone: '+503 7890 1111',
      logoUrl: 'https://placehold.co/120x120?text=Sabores'
    },
    {
      id: 'empresa-002',
      taxId: 'RUC-002',
      businessName: 'Cafetería S.R.L.',
      commercialName: 'Aroma Andino',
      email: 'hola@aromaandino.com',
      phone: '+503 7456 3344',
      logoUrl: 'https://placehold.co/120x120?text=Aroma'
    }
  ]);

  private readonly menusSignal = signal<Menu[]>([
    {
      id: 'menu-desayunos',
      name: 'Desayunos',
      active: true,
      companyId: 'empresa-001'
    },
    {
      id: 'menu-almuerzos',
      name: 'Almuerzos',
      active: true,
      companyId: 'empresa-001'
    },
    {
      id: 'menu-meriendas',
      name: 'Meriendas',
      active: false,
      companyId: 'empresa-002'
    }
  ]);

  private readonly categoriesSignal = signal<Category[]>([
    {
      id: 'cat-entradas',
      name: 'Entradas',
      active: true,
      companyId: 'empresa-001'
    },
    {
      id: 'cat-bebidas',
      name: 'Bebidas',
      active: true,
      companyId: 'empresa-001'
    },
    {
      id: 'cat-postres',
      name: 'Postres',
      active: false,
      companyId: 'empresa-002'
    }
  ]);

  private readonly productsSignal = signal<Product[]>([
    {
      id: 'prod-001',
      name: 'Ceviche Clásico',
      description: 'Pescado fresco marinado en limón con camote y canchita.',
      price: 36.5,
      imageUrl: 'https://placehold.co/300x200?text=Ceviche',
      categoryId: 'cat-entradas',
      menuIds: ['menu-almuerzos'],
      companyId: 'empresa-001'
    },
    {
      id: 'prod-002',
      name: 'Limonada de Hierbabuena',
      description: 'Bebida refrescante preparada al momento.',
      price: 10.9,
      imageUrl: 'https://placehold.co/300x200?text=Limonada',
      categoryId: 'cat-bebidas',
      menuIds: ['menu-desayunos', 'menu-almuerzos'],
      companyId: 'empresa-001'
    },
    {
      id: 'prod-003',
      name: 'Tiramisú',
      description: 'Postre italiano con queso mascarpone y café.',
      price: 18,
      imageUrl: 'https://placehold.co/300x200?text=Tiramisu',
      categoryId: 'cat-postres',
      menuIds: ['menu-meriendas'],
      companyId: 'empresa-002'
    }
  ]);

  private readonly usersSignal = signal<User[]>([
    {
      id: 'user-admin-001',
      username: 'admin@saboresdelmar.com',
      fullName: 'Administrador Sabores',
      role: 'ADMIN',
      companyId: 'empresa-001',
      active: true
    },
    {
      id: 'user-001',
      username: 'caja@saboresdelmar.com',
      fullName: 'Usuario Caja',
      role: 'USER',
      companyId: 'empresa-001',
      active: true
    },
    {
      id: 'user-admin-002',
      username: 'admin@aromaandino.com',
      fullName: 'Administrador Aroma',
      role: 'ADMIN',
      companyId: 'empresa-002',
      active: true
    }
  ]);

  /** Accesos de solo lectura para las señales. */
  readonly companies = this.companiesSignal.asReadonly();
  readonly menus = this.menusSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();

  readonly companyCount = computed(() => this.companies().length);
  readonly menuCount = computed(() => this.menus().length);
  readonly categoryCount = computed(() => this.categories().length);
  readonly productCount = computed(() => this.products().length);
  readonly activeUserCount = computed(() => this.users().filter((user) => user.active).length);

  setCompanies(companies: Company[]): void {
    this.companiesSignal.set(structuredClone(companies));
  }

  upsertCompany(company: Company): void {
    this.companiesSignal.update((list) => {
      const exists = list.some((item) => item.id === company.id);
      return exists ? list.map((item) => (item.id === company.id ? company : item)) : [...list, company];
    });
  }

  removeCompany(companyId: string): void {
    this.companiesSignal.update((list) => list.filter((company) => company.id !== companyId));
  }

  setMenus(menus: Menu[]): void {
    this.menusSignal.set(structuredClone(menus));
  }

  upsertMenu(menu: Menu): void {
    this.menusSignal.update((list) => {
      const exists = list.some((item) => item.id === menu.id);
      return exists ? list.map((item) => (item.id === menu.id ? menu : item)) : [...list, menu];
    });
  }

  removeMenu(menuId: string): void {
    this.menusSignal.update((list) => list.filter((menu) => menu.id !== menuId));
  }

  setCategories(categories: Category[]): void {
    this.categoriesSignal.set(structuredClone(categories));
  }

  upsertCategory(category: Category): void {
    this.categoriesSignal.update((list) => {
      const exists = list.some((item) => item.id === category.id);
      return exists ? list.map((item) => (item.id === category.id ? category : item)) : [...list, category];
    });
  }

  removeCategory(categoryId: string): void {
    this.categoriesSignal.update((list) => list.filter((category) => category.id !== categoryId));
  }

  setProducts(products: Product[]): void {
    this.productsSignal.set(structuredClone(products));
  }

  upsertProduct(product: Product): void {
    this.productsSignal.update((list) => {
      const exists = list.some((item) => item.id === product.id);
      return exists ? list.map((item) => (item.id === product.id ? product : item)) : [...list, product];
    });
  }

  removeProduct(productId: string): void {
    this.productsSignal.update((list) => list.filter((product) => product.id !== productId));
  }

  setUsers(users: User[]): void {
    this.usersSignal.set(structuredClone(users));
  }

  upsertUser(user: User): void {
    this.usersSignal.update((list) => {
      const exists = list.some((item) => item.id === user.id);
      return exists ? list.map((item) => (item.id === user.id ? user : item)) : [...list, user];
    });
  }

  removeUser(userId: string): void {
    this.usersSignal.update((list) => list.filter((user) => user.id !== userId));
  }
}
