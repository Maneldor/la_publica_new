'use client';

import { useState } from 'react';

interface OfferPreviewProps {
    formData: any;
}

// Helper function accessible to all components
const formatPrice = (price: string | number) => {
    if (!price) return '0€';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toLocaleString('ca-ES') + '€';
};

export function OfferPreview({ formData }: OfferPreviewProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const calculateDiscountPercentage = () => {
        if (!formData.originalPrice || !formData.price) return 0;
        const original = parseFloat(formData.originalPrice);
        const current = parseFloat(formData.price);
        if (original <= current) return 0;
        return Math.round(((original - current) / original) * 100);
    };

    const formatDate = (date: string) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ca-ES');
    };

    // Create mock offer data from form data
    const mockOffer = {
        id: 'preview',
        title: formData.title || 'Títol de l\'oferta',
        description: formData.description || formData.shortDescription || 'Descripció de l\'oferta apareixerà aquí...',
        company: {
            id: 1,
            name: formData.companyName || 'La teva empresa',
            logo: '/images/default-company.png',
            plan: 'Premium'
        },
        category: formData.categoryId || 'Categoria',
        originalPrice: parseFloat(formData.originalPrice) || 100,
        discountPrice: parseFloat(formData.price) || 80,
        discountPercentage: formData.discountPercentage || calculateDiscountPercentage(),
        images: formData.images?.length > 0 ? formData.images : ['/images/default-offer.jpg'],
        validUntil: formatDate(formData.expiresAt) || 'No definida',
        stock: null,
        isHighlighted: formData.featured || false,
        isFavorite: false,
        views: 0,
        saves: 0,
        createdAt: new Date().toISOString(),
        terms: formData.conditions || ''
    };

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Vista Llista</h4>
                    <button
                        onClick={() => setViewMode('grid')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                    >
                        Canviar a Grid
                    </button>
                </div>
                <OfferCardPreview offer={mockOffer} viewMode="list" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Vista Grid</h4>
                <button
                    onClick={() => setViewMode('list')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                >
                    Canviar a Llista
                </button>
            </div>
            <OfferCardPreview offer={mockOffer} viewMode="grid" />
        </div>
    );
}

// Simplified OfferCard component for preview
function OfferCardPreview({ offer, viewMode }: { offer: any; viewMode: 'grid' | 'list' }) {
    const [isHovered, setIsHovered] = useState(false);

    const getDiscountBadgeColor = () => {
        if (offer.discountPercentage >= 50) return { bg: '#ef4444', color: 'white' };
        if (offer.discountPercentage >= 30) return { bg: '#f59e0b', color: 'white' };
        if (offer.discountPercentage >= 15) return { bg: '#10b981', color: 'white' };
        return { bg: '#6b7280', color: 'white' };
    };

    const getPlanBadgeColor = () => {
        switch (offer.company.plan) {
            case 'Premium': return { bg: '#f59e0b', color: 'white' };
            case 'Estàndard': return { bg: '#10b981', color: 'white' };
            case 'Bàsic': return { bg: '#6b7280', color: 'white' };
            default: return { bg: '#6b7280', color: 'white' };
        }
    };

    if (viewMode === 'list') {
        const discountBadge = getDiscountBadgeColor();
        const planBadge = getPlanBadgeColor();

        return (
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    marginBottom: '16px',
                    position: 'relative'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Badge de descuento */}
                {offer.discountPercentage > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        backgroundColor: discountBadge.bg,
                        color: discountBadge.color,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '700'
                    }}>
                        -{offer.discountPercentage}%
                    </div>
                )}

                {/* Badge destacado */}
                {offer.isHighlighted && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                    }}>
                        DESTACADA
                    </div>
                )}

                <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Imagen */}
                    <div style={{
                        width: '120px',
                        height: '80px',
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6',
                        backgroundImage: `url(${offer.images[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#6b7280'
                    }}>
                        {!offer.images[0].includes('default') ? '' : 'Imatge'}
                    </div>

                    {/* Contenido */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#2c3e50',
                                    margin: '0 0 4px 0',
                                    lineHeight: '1.3'
                                }}>
                                    {offer.title}
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#3b82f6',
                                        fontWeight: '500'
                                    }}>
                                        {offer.category}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#8e8e93'
                                    }}>
                                        Vàlid fins: {offer.validUntil}
                                    </span>
                                </div>
                            </div>

                            {/* Precios */}
                            <div style={{ textAlign: 'right' }}>
                                {offer.discountPercentage > 0 ? (
                                    <>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#8e8e93',
                                            textDecoration: 'line-through'
                                        }}>
                                            {formatPrice(offer.originalPrice)}
                                        </div>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#ef4444'
                                        }}>
                                            {offer.discountPrice === 0 ? 'GRATUÏT' : formatPrice(offer.discountPrice)}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#16a34a'
                                    }}>
                                        {formatPrice(offer.originalPrice)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p style={{
                            fontSize: '13px',
                            color: '#6c757d',
                            margin: '0 0 12px 0',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}>
                            {offer.description}
                        </p>

                        {/* Footer: Empresa */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f3f4f6',
                                    backgroundImage: `url(${offer.company.logo})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }} />
                                <span style={{
                                    fontSize: '12px',
                                    color: '#6c757d',
                                    fontWeight: '500'
                                }}>
                                    {offer.company.name}
                                </span>
                                <span style={{
                                    fontSize: '10px',
                                    backgroundColor: planBadge.bg,
                                    color: planBadge.color,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '600'
                                }}>
                                    {offer.company.plan}
                                </span>
                            </div>

                            <div style={{
                                fontSize: '11px',
                                color: '#8e8e93'
                            }}>
                                Preview
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Vista Grid
    const discountBadge = getDiscountBadgeColor();

    return (
        <div
            style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                height: '320px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badge de descuento */}
            {offer.discountPercentage > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: discountBadge.bg,
                    color: discountBadge.color,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '700',
                    zIndex: 1
                }}>
                    -{offer.discountPercentage}%
                </div>
            )}

            {/* Badge destacado */}
            {offer.isHighlighted && (
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    zIndex: 1
                }}>
                    DESTACADA
                </div>
            )}

            {/* Imagen principal */}
            <div style={{
                height: '120px',
                backgroundColor: '#f3f4f6',
                backgroundImage: `url(${offer.images[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#6b7280'
            }}>
                {!offer.images[0].includes('default') ? '' : 'Imatge de l\'oferta'}
            </div>

            {/* Contenido */}
            <div style={{
                padding: '16px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Categoria */}
                <span style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    fontWeight: '500',
                    marginBottom: '8px'
                }}>
                    {offer.category}
                </span>

                {/* Título */}
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    margin: '0 0 12px 0',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    flex: 1
                }}>
                    {offer.title}
                </h3>

                {/* Precios */}
                <div style={{ marginBottom: '12px' }}>
                    {offer.discountPercentage > 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                fontSize: '14px',
                                color: '#8e8e93',
                                textDecoration: 'line-through'
                            }}>
                                {formatPrice(offer.originalPrice)}
                            </span>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#ef4444'
                            }}>
                                {offer.discountPrice === 0 ? 'GRATUÏT' : formatPrice(offer.discountPrice)}
                            </span>
                        </div>
                    ) : (
                        <span style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#16a34a'
                        }}>
                            {formatPrice(offer.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Footer: Solo empresa */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            backgroundImage: `url(${offer.company.logo})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                        <span style={{
                            fontSize: '12px',
                            color: '#6c757d',
                            fontWeight: '500'
                        }}>
                            {offer.company.name}
                        </span>
                    </div>
                    <span style={{
                        fontSize: '10px',
                        color: '#8e8e93'
                    }}>
                        Preview
                    </span>
                </div>
            </div>
        </div>
    );
}
