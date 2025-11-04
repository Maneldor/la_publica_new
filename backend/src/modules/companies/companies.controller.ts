import { Request, Response } from 'express';
import { CompaniesService } from './companies.service';

const companiesService = new CompaniesService();

// Registro simple de empresa (solo nombre, email, password)
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Crear empresa básica para registro
    const empresaData = {
      name,
      email,
      description: `Empresa ${name}`, // Descripción por defecto
      sector: 'otros', // Sector por defecto
      size: 'pequeña' as const, // Tamaño por defecto
      isVerified: false, // Pendiente de verificación
      isActive: false, // Inactiva hasta verificación
      configuration: {
        status: 'pending' as const
      }
    };

    const empresa = await companiesService.registerCompany(empresaData, password);

    res.status(201).json({
      success: true,
      data: empresa,
      mensaje: 'Empresa registrada exitosamente. Pendiente de verificación por administrador.'
    });
  } catch (error: any) {
    console.error('Error registrando empresa:', error);
    res.status(error.message.includes('existe') ? 409 : 500).json({
      success: false,
      error: error.message
    });
  }
};

// Perfil de empresa
export const createCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const empresa = await companiesService.createCompany({
      ...req.body,
      propietarioId: user.id
    });

    res.status(201).json({
      success: true,
      data: empresa,
      mensaje: 'Empresa creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando empresa:', error);
    res.status(error.message.includes('existe') ? 409 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const listCompanies = async (req: Request, res: Response) => {
  try {
    const {
      sector,
      tamaño,
      verificada,
      activa,
      ciudad,
      provincia,
      busqueda,
      conServicios,
      conProductos,
      limit,
      offset
    } = req.query;

    const resultado = await companiesService.listCompanies({
      sector: sector as string,
      size: tamaño as 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional',
      isVerified: verificada === 'true',
      isActive: activa !== 'false',
      city: ciudad as string,
      province: provincia as string,
      search: busqueda as string,
      withServices: conServicios === 'true',
      withProducts: conProductos === 'true',
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.companies,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresa = await companiesService.getCompanyById(id);

    res.json({
      success: true,
      data: empresa
    });
  } catch (error: any) {
    console.error('Error obteniendo empresa:', error);
    res.status(error.message === 'Empresa no encontrada' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const empresa = await companiesService.updateCompany(id, user.id, req.body);

    res.json({
      success: true,
      data: empresa,
      mensaje: 'Empresa actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando empresa:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

// Servicios
export const createService = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const servicio = await companiesService.createService({
      ...req.body,
      empresaId: id,
      usuarioId: user.id
    });

    res.status(201).json({
      success: true,
      data: servicio,
      mensaje: 'Servicio creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando servicio:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const listServices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoria, subcategoria, modalidad, activo, busqueda, limit, offset } = req.query;

    const resultado = await companiesService.listServices(id, {
      categoria: categoria as string,
      subcategoria: subcategoria as string,
      modalidad: modalidad as 'presencial' | 'online' | 'hibrido',
      activo: activo !== 'false',
      busqueda: busqueda as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.servicios,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Productos
export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const producto = await companiesService.createProduct({
      ...req.body,
      empresaId: id,
      usuarioId: user.id
    });

    res.status(201).json({
      success: true,
      data: producto,
      mensaje: 'Producto creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando producto:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      categoria,
      subcategoria,
      disponible,
      activo,
      precioMin,
      precioMax,
      busqueda,
      limit,
      offset
    } = req.query;

    const resultado = await companiesService.listProducts(id, {
      categoria: categoria as string,
      subcategoria: subcategoria as string,
      disponible: disponible === 'true',
      activo: activo !== 'false',
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      busqueda: busqueda as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.productos,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Asesoramiento
export const requestAdvice = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const asesoramiento = await companiesService.requestAdvice({
      ...req.body,
      empresaId: id,
      clienteId: user.id
    });

    res.status(201).json({
      success: true,
      data: asesoramiento,
      mensaje: 'Solicitud de asesoramiento enviada exitosamente'
    });
  } catch (error: any) {
    console.error('Error solicitando asesoramiento:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listAdviceRequests = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const {
      estado,
      urgencia,
      servicioId,
      fechaDesde,
      fechaHasta,
      limit,
      offset
    } = req.query;

    const resultado = await companiesService.listAdviceRequests(id, user.id, {
      estado: estado as 'pendiente' | 'en_progreso' | 'completado' | 'cancelado',
      urgencia: urgencia as 'baja' | 'media' | 'alta',
      servicioId: servicioId as string,
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: resultado.asesoramientos,
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo asesoramientos:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateAdviceStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { adviceId } = req.params;
    const asesoramiento = await companiesService.updateAdviceStatus(adviceId, user.id, req.body);

    res.json({
      success: true,
      data: asesoramiento,
      mensaje: 'Estado de asesoramiento actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando asesoramiento:', error);
    res.status(error.message.includes('permisos') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
};

// Valoraciones
export const createRating = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const valoracion = await companiesService.createRating({
      ...req.body,
      empresaId: id,
      usuarioId: user.id
    });

    res.status(201).json({
      success: true,
      data: valoracion,
      mensaje: 'Valoración creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando valoración:', error);
    res.status(error.message.includes('valorado') ? 409 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCompanyRatings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { puntuacion, limit, offset } = req.query;

    const resultado = await companiesService.getCompanyRatings(id, {
      rating: puntuacion ? Number(puntuacion) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: {
        valoraciones: resultado.valoraciones,
        estadisticas: {
          total: resultado.total,
          promedio: resultado.promedio,
          distribucionPuntuaciones: resultado.distribucionPuntuaciones
        }
      },
      pagination: {
        total: resultado.total,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo valoraciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};