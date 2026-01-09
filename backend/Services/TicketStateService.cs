namespace MDAyuda.API.Services
{
    /// <summary>
    /// Servicio para validar transiciones de estado de tickets.
    /// Implementa una máquina de estados que define qué transiciones son válidas
    /// según el rol del usuario.
    /// </summary>
    public static class TicketStateService
    {
        /// <summary>
        /// Transiciones permitidas para empleados.
        /// Los empleados no pueden cerrar tickets directamente desde Abierto o EnEspera,
        /// ni reabrir tickets cerrados.
        /// </summary>
        private static readonly Dictionary<string, List<string>> TransicionesEmpleado = new()
        {
            {"Abierto", new List<string> {"EnProceso", "EnEspera"}},
            {"EnProceso", new List<string> {"EnEspera", "Resuelto", "Abierto"}},
            {"EnEspera", new List<string> {"EnProceso", "Abierto"}},
            {"Resuelto", new List<string> {"Cerrado", "EnProceso"}},
            {"Cerrado", new List<string>()}
        };

        /// <summary>
        /// Transiciones permitidas para administradores.
        /// Los administradores pueden cerrar tickets desde cualquier estado
        /// y reabrir tickets cerrados.
        /// </summary>
        private static readonly Dictionary<string, List<string>> TransicionesAdmin = new()
        {
            {"Abierto", new List<string> {"EnProceso", "EnEspera", "Cerrado"}},
            {"EnProceso", new List<string> {"EnEspera", "Resuelto", "Abierto", "Cerrado"}},
            {"EnEspera", new List<string> {"EnProceso", "Abierto", "Cerrado"}},
            {"Resuelto", new List<string> {"Cerrado", "EnProceso"}},
            {"Cerrado", new List<string> {"EnProceso"}}
        };

        /// <summary>
        /// Valida si una transición de estado es permitida para el rol dado.
        /// </summary>
        /// <param name="estadoActual">El estado actual del ticket</param>
        /// <param name="nuevoEstado">El estado al que se quiere cambiar</param>
        /// <param name="userRole">El rol del usuario (Admin o Empleado)</param>
        /// <returns>true si la transición es válida, false en caso contrario</returns>
        public static bool IsValidTransition(string estadoActual, string nuevoEstado, string userRole)
        {
            // Si el estado no cambia, es válido
            if (estadoActual == nuevoEstado)
                return true;

            var transiciones = userRole == "Admin" ? TransicionesAdmin : TransicionesEmpleado;
            return transiciones.ContainsKey(estadoActual) &&
                   transiciones[estadoActual].Contains(nuevoEstado);
        }

        /// <summary>
        /// Obtiene la lista de estados a los que se puede transicionar desde el estado actual.
        /// </summary>
        /// <param name="estadoActual">El estado actual del ticket</param>
        /// <param name="userRole">El rol del usuario (Admin o Empleado)</param>
        /// <returns>Lista de estados permitidos para transicionar</returns>
        public static List<string> GetTransicionesPermitidas(string estadoActual, string userRole)
        {
            var transiciones = userRole == "Admin" ? TransicionesAdmin : TransicionesEmpleado;
            return transiciones.ContainsKey(estadoActual)
                ? new List<string>(transiciones[estadoActual])
                : new List<string>();
        }

        /// <summary>
        /// Obtiene un mensaje descriptivo del error de transición.
        /// </summary>
        /// <param name="estadoActual">El estado actual del ticket</param>
        /// <param name="nuevoEstado">El estado al que se intentó cambiar</param>
        /// <param name="userRole">El rol del usuario</param>
        /// <returns>Mensaje descriptivo del error</returns>
        public static string GetTransitionErrorMessage(string estadoActual, string nuevoEstado, string userRole)
        {
            var transicionesPermitidas = GetTransicionesPermitidas(estadoActual, userRole);

            if (transicionesPermitidas.Count == 0)
            {
                return $"No se permite cambiar el estado desde '{estadoActual}' con tu rol actual";
            }

            return $"No se permite cambiar de '{estadoActual}' a '{nuevoEstado}'. " +
                   $"Transiciones permitidas: {string.Join(", ", transicionesPermitidas)}";
        }
    }
}
