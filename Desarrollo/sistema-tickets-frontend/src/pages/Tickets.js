import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from 'react-modal'; // Modal para el formulario
import '../App.css';
import '../styles/tickets.css'
import guias from '../json_test/guias.json';
import apiClient from '../components/apiClient';

// Configura el estilo del modal
Modal.setAppElement('#root');

const Tickets = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    comentario: '',
    categoria: '',
    prioridad: '',
    servicio: '',
    estado: '', // Inicialmente vacío, se llenará al cargar los estados
  });// captura los datos del formulario para posterior post request
  

  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [activeStep, setActiveStep] = useState(null);
  
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para el modal
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [guiaContenido, setGuiaContenido] = useState(null);

  const handleGuiaChange = (e) => {
    const categoriaId = parseInt(e.target.value);
  
    // If categoriaId is NaN, set the content to null
    if (isNaN(categoriaId)) {
      setGuiaContenido(0); // Si no hay categoría, no hay contenido
    } else {
      setSelectedCategoryId(categoriaId);  // Update the selected category state
  
      // Busca el contenido de la guía basado en el id de la categoría
      const guia = guias.find(guia => guia.id_categoria === categoriaId);
      setGuiaContenido(guia || 0);
      
      const relatedService = servicios.find(
        (servicio) => servicio.categoria_id === categoriaId
      );
  
      setFormData((prevData) => ({
        ...prevData,
        categoria: categoriaId, // Establece la categoría en formData
        servicio: relatedService ? relatedService.id : '',
      }));
    }
  };
   // maneja cambios en el la guia
  const handleOpenModal = () => {
    setModalIsOpen(true);
  }; // maneja el abrir el modal

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setFormData((prevData) => ({
      ...prevData,
      titulo: '',
      comentario: '',
      prioridad: '',
    }));
  }; // manjea el cerrar el modal

  const toggleStep = (stepId) => {
    if (activeStep === stepId) {
      setActiveStep(null); // Cierra el paso si ya está abierto
    } else {
      setActiveStep(stepId); // Abre el paso
    }
  };
  useEffect(() => {
    const fetchData = async (url, setState) => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      try {
        const response = await apiClient.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setState(response.data);
      } catch (error) {
        console.error(`Error al cargar los datos desde ${url}:`, error);
      }
    };

    // Cargar todas las listas de datos
    fetchData('categorias/', setCategorias);
    fetchData('prioridades/', setPrioridades);
    fetchData('servicios/', setServicios);
    fetchData('estados/', setEstados);
  }, [navigate]); // gets the data

  useEffect(() => {
    const estadoAbierto = estados.find((estado) => estado.nom_estado === 'Abierto');
    if (estadoAbierto) {
      setFormData((prevData) => ({
        ...prevData,
        estado: estadoAbierto.id,
      }));
    }
  }, [estados]);// Establecer el estado predeterminado como "Abierto" si existe en la lista de estados
  const handleCategoryChange = (e) => {
    const categoriaId = parseInt(e.target.value);
    setFormData((prevData) => ({
      ...prevData,
      categoria: categoriaId,
    }));

    const relatedService = servicios.find(
      (servicio) => servicio.categoria_id === categoriaId
    );

    setFormData((prevData) => ({
      ...prevData,
      servicio: relatedService ? relatedService.id : '',
    }));
  }; // manejo de cambios de categoria
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }; //manejo de cambios generales

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const adjustedData = {
      ...formData,
    };
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.post('tickets/', adjustedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response) {
        alert('Ticket creado con éxito');
        navigate('/tickets');
        setFormData({
          titulo: '',
          comentario: '',
          categoria: '',
          prioridad: '',
          servicio: '',
          estado: estados.find((estado) => estado.nom_estado === 'Abierto')?.id || '', // Restablecer a "Abierto"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un problema al crear el ticket');
    }
  }; // manda request post con datos importantes
  const pasos = [
    {
      id: 1,
      titulo: 'Paso 1: Leer la guía de autoayuda',
      subpasos: [
        'Abre la guía desde el menú de autoayuda.',
        'Lee las instrucciones básicas para entender cómo resolver tu problema.',
        'Sigue los pasos indicados en la guía.',
        'Si las instrucciones no solucionan tu problema, continúa al siguiente paso y crea un ticket.',
      ],
    },
    {
      id: 2,
      titulo: 'Paso 2: Crear un ticket',
      subpasos: [
        'Haz clic en "Crear Ticket" desde el menú.',
        'La categoría se seleccionará automáticamente según la guía que hayas leído.',
        'Si la categoría no es correcta, podrás cambiarla manualmente.',
        'Rellena los datos del formulario con una descripción clara de tu problema.',
        'Revisa todo antes de hacer clic en "Crear Ticket".',
      ],
    },
    {
      id: 3,
      titulo: 'Paso 3: Revisar el estado del ticket',
      subpasos: [
        'Ve a "Lista de Tickets" en el menú para ver los tickets creados.',
        'Selecciona el ticket que quieres revisar.',
        'Revisa su estado y los comentarios proporcionados.',
        'Si necesitas más ayuda, puedes agregar comentarios o cerrar el ticket si ya se resolvió.',
      ],
    },
  ];
  return (
    <div className="guia-usuario-container">
      <h2 className="guia-usuario-titulo">Creación de tickets</h2>

      <div className="lista-desplegable">
        <label style={{color:"black"}}>Selecciona una categoría:</label>
        <select onChange={handleGuiaChange} value={selectedCategoryId}>
          <option value={0}>Información general</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nom_categoria}
            </option>
          ))}
        </select>
      </div>

      {/* Renderiza información general si no hay categoría seleccionada */}
      {isNaN(selectedCategoryId) || selectedCategoryId === null || selectedCategoryId === 0 ? (
      <div className="guia-container">
      <h3>Guía de Usuario</h3>
        <p>Esta guía te ayudará a usar el sistema de autoayuda y a gestionar tus tickets de forma eficiente.</p>  
      {pasos.map((paso) => (
        <div key={paso.id} className="paso">
          <h4
            className="expand-title"
            onClick={() => toggleStep(paso.id)}
          >
            {paso.titulo}
            <span className={`expand-icon ${activeStep === paso.id ? 'open' : ''}`}>
              &#9660;
            </span>
          </h4>
          <ul className={`subpasos ${activeStep === paso.id ? 'active' : ''}`}>
            {paso.subpasos.map((subpaso, index) => (
              <li key={index} className="subpaso">{subpaso}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
      ) : (
        // Renderiza las instrucciones de la guía seleccionada
        guiaContenido && (
          <div className="guia-container">
            <h3>{guiaContenido.titulo}</h3>
            <p>{guiaContenido.descripcion}</p>
              <div key={0} className="paso">
              <h4
                className="expand-title"
                onClick={() => toggleStep(0)}
              >
               instrucciones 
              <span className={`expand-icon ${activeStep === 0 ? 'open' : ''}`}>
                &#9660;
              </span>
              </h4>
                <ul className={`subpasos ${activeStep === 0 ? 'active' : ''}`}>
                  {guiaContenido.instrucciones.map((instruccion, index) => (
                    <li className="subpaso" key={index}>{instruccion}</li>
                  ))}
                </ul>
              </div>
          </div>
        )
      )}

      <button onClick={handleOpenModal} className="open-modal-button">
        🎫 Crear Ticket
      </button>

      {/* Modal para el formulario de creación de ticket */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Crear Ticket"
        className="custom-modal"
        overlayClassName="modal-overlay"
      >
        <h2>Crear Ticket</h2>

      <form className="ticket-form" onSubmit={handleSubmit}>
          {/* Campos del formulario */}

          {/* Titulo */}
        <div className="input-group">
          <label>📝 Título</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Escribe el título del ticket"
          />
        </div>

        {/* Comentario */}
        <div className="input-group">
          <label>💬 Comentario</label>
          <textarea
            name="comentario"
            value={formData.comentario}
            onChange={handleChange}
            required
            placeholder="Escribe un comentario"
          ></textarea>
        </div>

        {/* Categoría */}
        <div className="input-group">
          <label>📂 Categoría</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nom_categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridad */}
        <div className="input-group">
          <label>⚡ Prioridad</label>
          <select
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una prioridad</option>
            {prioridades.map((prioridad) => (
              <option key={prioridad.id} value={prioridad.id}>
                {prioridad.num_prioridad}
              </option>
            ))}
          </select>
        </div>

        {/* Servicio */}
        <div className="input-group">
          <label>🔧 Servicio</label>
          <select
            name="servicio"
            value={formData.servicio}
            required
            disabled
          >
            <option value="">Seleccione un servicio</option>
            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.titulo_servicio}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="input-group">
          <label>📌 Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            disabled
          >
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nom_estado}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">🚀 Crear Ticket</button>
      </form>

        {/*<button onClick={handleCloseModal}>Cerrar</button>*/}
      <Link to="/tickets-list" className="view-tickets-link">
        📋 Ver Lista de Tickets
      </Link>
      </Modal>
    </div>
  );
};

export default Tickets;
