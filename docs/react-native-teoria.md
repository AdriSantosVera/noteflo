# Teoría de React Native

## React Native vs aplicación nativa

React Native permite desarrollar aplicaciones móviles utilizando JavaScript o TypeScript a partir de un modelo basado en React. A diferencia de esto, una aplicación nativa se desarrolla con lenguajes específicos de cada plataforma, como Swift en iOS o Kotlin en Android.

La principal ventaja de React Native es la posibilidad de reutilizar gran parte del código entre plataformas, lo que acelera el desarrollo. Por otro lado, las aplicaciones nativas ofrecen un mayor control sobre el rendimiento y el acceso a funcionalidades de bajo nivel del sistema.

---

## Metro Bundler

Metro es el empaquetador de JavaScript utilizado por React Native. Su función principal es procesar el código fuente, transformarlo y generar el bundle que se ejecuta en la aplicación.

Además, permite funcionalidades clave durante el desarrollo, como el recargado rápido (hot reload), facilitando una iteración ágil y eficiente.

---

## Expo Go vs Development Build

Expo Go es una herramienta que permite ejecutar la aplicación de forma rápida sin necesidad de compilarla, lo que resulta ideal en fases iniciales o para pruebas rápidas.

Sin embargo, cuando el proyecto requiere el uso de módulos nativos personalizados o configuraciones específicas, es necesario utilizar un Development Build, que genera una versión propia de la aplicación más cercana a un entorno real.

---

## Tabs, Stack y modales

En React Native, la navegación se organiza mediante distintos patrones:

- Las **Tabs** se utilizan como navegación principal entre secciones, como notas, checklists e ideas.
- La navegación tipo **Stack** permite moverse entre pantallas relacionadas, como pasar de un listado a un detalle.
- Los **modales** son útiles para interacciones breves, como crear o editar contenido, sin abandonar el contexto actual.

---

## useState vs Context API vs Zustand

Existen diferentes formas de gestionar el estado en una aplicación:

- `useState` se utiliza para manejar estado local dentro de un componente.
- `Context API` permite compartir datos entre múltiples componentes sin necesidad de pasar props manualmente, aunque puede resultar menos eficiente en aplicaciones grandes.
- `Zustand` es una solución ligera para la gestión de estado global, que facilita una arquitectura más limpia, escalable y con menos re-renderizados innecesarios.

---

## FlashList

FlashList es un componente de listas de alto rendimiento desarrollado por Shopify. Se utiliza como alternativa a `FlatList` cuando se manejan grandes cantidades de datos.

Su principal ventaja es una gestión más eficiente del renderizado, lo que mejora la fluidez del desplazamiento y reduce posibles problemas de rendimiento.

---

## AsyncStorage

AsyncStorage es un sistema de almacenamiento local basado en pares clave-valor. Permite guardar información en el dispositivo del usuario de forma persistente.

Resulta especialmente útil para almacenar datos como notas, configuraciones o preferencias sin necesidad de conexión a internet. No obstante, presenta limitaciones en cuanto a seguridad y capacidad, por lo que en proyectos más avanzados puede ser necesario complementarlo con otras soluciones.