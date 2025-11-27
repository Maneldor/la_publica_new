import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export class CompaniesService {
  async registerCompany(data: {
    name: string;
    email: string;
    description: string;
    sector: string;
    size: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional';
    isVerified: boolean;
    isActive: boolean;
    configuration?: any;
  }, password: string) {
    // Verificar si ya existe una empresa con ese email
    const existingCompany = await prisma.companies.findFirst({
      where: {
        email: data.email
      }
    });

    if (existingCompany) {
      throw new Error('Ya existe una empresa registrada con ese email');
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });

    if (existingUser) {
      throw new Error('Ya existe un usuario registrado con ese email');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y empresa en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario para la empresa
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          primaryRole: UserRole.COMPANY_MANAGER, // Rol de gestor de empresa
          isActive: true
        }
      });

      // Crear la empresa
      const company = await tx.companies.create({
        data: {
          name: data.name,
          description: data.description,
          sector: data.sector,
          size: data.size,
          email: data.email,
          isVerified: data.isVerified,
          isActive: data.isActive,
          configuration: data.configuration ? JSON.stringify(data.configuration) : undefined,
          userId: user.id
        }
      });

      return { user, company };
    });

    return {
      id: result.company.id,
      name: result.company.name,
      email: result.company.email,
      isVerified: result.company.isVerified,
      isActive: result.company.isActive,
      userId: result.user.id
    };
  }
  async createCompany(data: {
    name: string;
    description?: string;
    sector: string;
    size: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional';
    cif?: string;
    address?: any;
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: any;
    logoUrl?: string;
    certifications?: string[];
    foundingYear?: number;
    employeeCount?: number;
    annualRevenue?: number;
    configuration?: any;
    userId: string;
  }) {
    const existingCompany = await prisma.companies.findFirst({
      where: {
        OR: [
          { name: data.name },
          { cif: data.cif }
        ]
      }
    });

    if (existingCompany) {
      throw new Error('Ya existe una empresa con ese nombre o CIF');
    }

    const company = await prisma.companies.create({
      data: {
        name: data.name,
        description: data.description,
        sector: data.sector,
        size: data.size,
        cif: data.cif,
        address: data.address ? JSON.stringify(data.address) : undefined,
        phone: data.phone,
        email: data.email || '',
        website: data.website,
        socialMedia: data.socialMedia ? JSON.stringify(data.socialMedia) : undefined,
        logo: data.logoUrl,
        certifications: data.certifications ? JSON.stringify(data.certifications) : undefined,
        foundingYear: data.foundingYear,
        employeeCount: data.employeeCount,
        annualRevenue: data.annualRevenue,
        configuration: data.configuration ? JSON.stringify(data.configuration) : undefined,
        userId: data.userId,
        isVerified: false,
        isActive: true
      }
    });

    return {
      ...company,
      address: company.address ? JSON.parse(company.address as string) : null,
      socialMedia: company.socialMedia ? JSON.parse(company.socialMedia as string) : null,
      certifications: company.certifications ? JSON.parse(company.certifications as string) : [],
      configuration: company.configuration ? JSON.parse(company.configuration as string) : null
    };
  }

  async listCompanies(filters: {
    sector?: string;
    size?: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional';
    isVerified?: boolean;
    isActive?: boolean;
    city?: string;
    province?: string;
    search?: string;
    withServices?: boolean;
    withProducts?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.sector) where.sector = filters.sector;
    if (filters.size) where.size = filters.size;
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sector: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.city || filters.province) {
      const addressFilter = [];
      if (filters.city) addressFilter.push(`"city":"${filters.city}"`);
      if (filters.province) addressFilter.push(`"province":"${filters.province}"`);

      if (addressFilter.length > 0) {
        where.address = {
          contains: addressFilter.join(',')
        };
      }
    }

    if (filters.withServices) {
      where.services = {
        some: { isActive: true }
      };
    }

    if (filters.withProducts) {
      where.products = {
        some: { isActive: true }
      };
    }

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        orderBy: [
          { isVerified: 'desc' },
          { createdAt: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.companies.count({ where })
    ]);

    return {
      companies: companies.map(company => ({
        ...company,
        address: company.address ? JSON.parse(company.address as string) : null,
        socialMedia: company.socialMedia ? JSON.parse(company.socialMedia as string) : null,
        certifications: company.certifications ? JSON.parse(company.certifications as string) : [],
        configuration: company.configuration ? JSON.parse(company.configuration as string) : null
      })),
      total
    };
  }

  async getCompanyById(id: string) {
    const company = await prisma.companies.findUnique({
      where: { id }
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    const averageRating = await prisma.companyRating.aggregate({
      where: { companyId: id },
      _avg: { rating: true }
    });

    return {
      ...company,
      address: company.address ? JSON.parse(company.address as string) : null,
      socialMedia: company.socialMedia ? JSON.parse(company.socialMedia as string) : null,
      certifications: company.certifications ? JSON.parse(company.certifications as string) : [],
      configuration: company.configuration ? JSON.parse(company.configuration as string) : null,
      averageRating: averageRating._avg.rating || 0
    };
  }

  async updateCompany(id: string, userId: string, data: {
    name?: string;
    description?: string;
    sector?: string;
    size?: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional';
    address?: any;
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: any;
    logoUrl?: string;
    certifications?: string[];
    foundingYear?: number;
    employeeCount?: number;
    annualRevenue?: number;
    configuration?: any;
  }) {
    const company = await prisma.companies.findUnique({
      where: { id }
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    if (company.userId !== userId) {
      throw new Error('No tienes permisos para editar esta empresa');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.foundingYear !== undefined) updateData.foundingYear = data.foundingYear;
    if (data.employeeCount !== undefined) updateData.employeeCount = data.employeeCount;
    if (data.annualRevenue !== undefined) updateData.annualRevenue = data.annualRevenue;

    if (data.address !== undefined) updateData.address = JSON.stringify(data.address);
    if (data.socialMedia !== undefined) updateData.socialMedia = JSON.stringify(data.socialMedia);
    if (data.certifications !== undefined) updateData.certifications = JSON.stringify(data.certifications);
    if (data.configuration !== undefined) updateData.configuration = JSON.stringify(data.configuration);

    const updatedCompany = await prisma.companies.update({
      where: { id },
      data: updateData
    });

    return {
      ...updatedCompany,
      address: updatedCompany.address ? JSON.parse(updatedCompany.address as string) : null,
      socialMedia: updatedCompany.socialMedia ? JSON.parse(updatedCompany.socialMedia as string) : null,
      certifications: updatedCompany.certifications ? JSON.parse(updatedCompany.certifications as string) : [],
      configuration: updatedCompany.configuration ? JSON.parse(updatedCompany.configuration as string) : null
    };
  }

  async createService(data: {
    companyId: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    features?: string[];
    pricing?: any;
    duration?: string;
    modality: 'presencial' | 'online' | 'hibrido';
    availability?: any;
    order?: number;
    userId: string;
  }) {
    const company = await prisma.companies.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    if (company.userId !== data.userId) {
      throw new Error('No tienes permisos para crear servicios en esta empresa');
    }

    const servicio = await prisma.companyService.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        features: data.features ? JSON.stringify(data.features) : undefined,
        pricing: data.pricing ? JSON.stringify(data.pricing) : undefined,
        duration: data.duration,
        modality: data.modality,
        availability: data.availability ? JSON.stringify(data.availability) : undefined,
        order: data.order || 0,
        isActive: true
      }
    });

    return {
      ...servicio,
      features: servicio.features ? JSON.parse(servicio.features as string) : [],
      pricing: servicio.pricing ? JSON.parse(servicio.pricing as string) : null,
      availability: servicio.availability ? JSON.parse(servicio.availability as string) : null
    };
  }

  async listServices(empresaId: string, filters: {
    categoria?: string;
    subcategoria?: string;
    modalidad?: 'presencial' | 'online' | 'hibrido';
    activo?: boolean;
    busqueda?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      companyId: empresaId,
      isActive: filters.activo !== false
    };

    if (filters.categoria) where.category = filters.categoria;
    if (filters.subcategoria) where.subcategory = filters.subcategoria;
    if (filters.modalidad) where.modality = filters.modalidad;

    if (filters.busqueda) {
      where.OR = [
        { name: { contains: filters.busqueda, mode: 'insensitive' } },
        { description: { contains: filters.busqueda, mode: 'insensitive' } }
      ];
    }

    const [servicios, total] = await Promise.all([
      prisma.companyService.findMany({
        where,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.companyService.count({ where })
    ]);

    return {
      servicios: servicios.map(servicio => ({
        ...servicio,
        features: servicio.features ? JSON.parse(servicio.features as string) : [],
        pricing: servicio.pricing ? JSON.parse(servicio.pricing as string) : null,
        availability: servicio.availability ? JSON.parse(servicio.availability as string) : null
      })),
      total
    };
  }

  async createProduct(data: {
    companyId: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    price: number;
    features?: string[];
    images?: string[];
    stock?: number;
    isAvailable: boolean;
    order?: number;
    userId: string;
  }) {
    const company = await prisma.companies.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    if (company.userId !== data.userId) {
      throw new Error('No tienes permisos para crear productos en esta empresa');
    }

    const producto = await prisma.companyProduct.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price,
        features: data.features ? JSON.stringify(data.features) : undefined,
        images: data.images || [],
        stock: data.stock,
        isAvailable: data.isAvailable,
        order: data.order || 0,
        isActive: true
      }
    });

    return {
      ...producto,
      features: producto.features ? JSON.parse(producto.features as string) : [],
      images: producto.images || []
    };
  }

  async listProducts(empresaId: string, filters: {
    categoria?: string;
    subcategoria?: string;
    disponible?: boolean;
    activo?: boolean;
    precioMin?: number;
    precioMax?: number;
    busqueda?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      companyId: empresaId,
      isActive: filters.activo !== false
    };

    if (filters.categoria) where.category = filters.categoria;
    if (filters.subcategoria) where.subcategory = filters.subcategoria;
    if (filters.disponible !== undefined) where.isAvailable = filters.disponible;

    if (filters.precioMin || filters.precioMax) {
      where.price = {};
      if (filters.precioMin) where.price.gte = filters.precioMin;
      if (filters.precioMax) where.price.lte = filters.precioMax;
    }

    if (filters.busqueda) {
      where.OR = [
        { name: { contains: filters.busqueda, mode: 'insensitive' } },
        { description: { contains: filters.busqueda, mode: 'insensitive' } }
      ];
    }

    const [productos, total] = await Promise.all([
      prisma.companyProduct.findMany({
        where,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.companyProduct.count({ where })
    ]);

    return {
      productos: productos.map(producto => ({
        ...producto,
        features: producto.features ? JSON.parse(producto.features as string) : [],
        images: producto.images || []
      })),
      total
    };
  }

  async requestAdvice(data: {
    companyId: string;
    serviceId?: string;
    clientId: string;
    subject: string;
    description: string;
    urgency: 'baja' | 'media' | 'alta';
    estimatedBudget?: number;
    deadline?: Date;
    contact?: any;
  }) {
    const company = await prisma.companies.findUnique({
      where: { id: data.companyId }
    });

    if (!company || !company.isActive) {
      throw new Error('Empresa no encontrada o inactiva');
    }

    const asesoramiento = await prisma.companyAdvisory.create({
      data: {
        companyId: data.companyId,
        serviceId: data.serviceId,
        clientId: data.clientId,
        title: data.subject,
        subject: data.subject,
        description: data.description,
        urgency: data.urgency,
        estimatedBudget: data.estimatedBudget,
        deadline: data.deadline,
        contact: data.contact ? JSON.stringify(data.contact) : undefined,
        status: 'pendiente',
        requestDate: new Date()
      }
    });

    return {
      ...asesoramiento,
      contact: asesoramiento.contact ? JSON.parse(asesoramiento.contact as string) : null
    };
  }

  async listAdviceRequests(empresaId: string, usuarioId: string, filters: {
    estado?: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
    urgencia?: 'baja' | 'media' | 'alta';
    servicioId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }) {
    const company = await prisma.companies.findUnique({
      where: { id: empresaId }
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    if (company.userId !== usuarioId) {
      throw new Error('No tienes permisos para ver los asesoramientos de esta empresa');
    }

    const where: any = { companyId: empresaId };

    if (filters.estado) where.status = filters.estado;
    if (filters.urgencia) where.urgency = filters.urgencia;
    if (filters.servicioId) where.serviceId = filters.servicioId;

    if (filters.fechaDesde || filters.fechaHasta) {
      where.requestDate = {};
      if (filters.fechaDesde) where.requestDate.gte = filters.fechaDesde;
      if (filters.fechaHasta) where.requestDate.lte = filters.fechaHasta;
    }

    const [asesoramientos, total] = await Promise.all([
      prisma.companyAdvisory.findMany({
        where,
        orderBy: [
          { urgency: 'desc' },
          { requestDate: 'desc' }
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.companyAdvisory.count({ where })
    ]);

    return {
      asesoramientos: asesoramientos.map((asesoramiento: any) => ({
        ...asesoramiento,
        contact: asesoramiento.contact ? JSON.parse(asesoramiento.contact as string) : null
      })),
      total
    };
  }

  async updateAdviceStatus(id: string, usuarioId: string, data: {
    status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
    response?: string;
    finalBudget?: number;
    responseDate?: Date;
  }) {
    const asesoramiento = await prisma.companyAdvisory.findUnique({
      where: { id },
      include: {
        company: true
      }
    });

    if (!asesoramiento) {
      throw new Error('Asesoramiento no encontrado');
    }

    if (asesoramiento.company.userId !== usuarioId) {
      throw new Error('No tienes permisos para actualizar este asesoramiento');
    }

    const asesoramientoActualizado = await prisma.companyAdvisory.update({
      where: { id },
      data: {
        status: data.status,
        response: data.response,
        finalBudget: data.finalBudget,
        responseDate: data.responseDate || new Date()
      }
    });

    return {
      ...asesoramientoActualizado,
      contact: asesoramientoActualizado.contact ? JSON.parse(asesoramientoActualizado.contact as string) : null
    };
  }

  async createRating(data: {
    companyId: string;
    userId: string;
    rating: number;
    comment?: string;
    serviceId?: string;
    advisoryId?: string;
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('La puntuación debe estar entre 1 y 5');
    }

    const existingRating = await prisma.companyRating.findFirst({
      where: {
        companyId: data.companyId,
        userId: data.userId
      }
    });

    if (existingRating) {
      throw new Error('Ya has valorado esta empresa');
    }

    const valoracion = await prisma.companyRating.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment,
        serviceId: data.serviceId,
        advisoryId: data.advisoryId
      }
    });

    return valoracion;
  }

  async getCompanyRatings(empresaId: string, filters: {
    rating?: number;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { companyId: empresaId };
    if (filters.rating) where.rating = filters.rating;

    const [valoraciones, total, estadisticas] = await Promise.all([
      prisma.companyRating.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0
      }),
      prisma.companyRating.count({ where }),
      prisma.companyRating.groupBy({
        by: ['rating'],
        where: { companyId: empresaId },
        _count: { _all: true }
      })
    ]);

    const promedio = await prisma.companyRating.aggregate({
      where: { companyId: empresaId },
      _avg: { rating: true }
    });

    const distribucionPuntuaciones = estadisticas.reduce((acc, item) => {
      acc[item.rating] = item._count._all;
      return acc;
    }, {} as Record<number, number>);

    return {
      valoraciones,
      total,
      promedio: promedio._avg.rating || 0,
      distribucionPuntuaciones
    };
  }
}