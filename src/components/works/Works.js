/* eslint-disable no-unused-vars */
import React from "react";
import { useState } from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextDecrypt } from "../content/TextDecrypt";

import './Works.css';

// Import ../../assets/recentprojects/
import AfghanKazan from '../../assets/recentprojects/react-AfghanKazan.png';
import Sofilight from '../../assets/recentprojects/Sofilight.png';
import AvtoHype from '../../assets/recentprojects/AvtoHype.png';
import Ceevisor from '../../assets/recentprojects/Ceevisor.png';
import Beton from '../../assets/recentprojects/Beton.png';

const useStyles = makeStyles((theme) => ({
  main: {
    maxWidth: '100vw',
    marginTop: '3em',
    marginBottom: "auto",
  },
}));

export const Works = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState([
    { 
      id: 1,
      title: 'Afghan Kazan E-Commerce Store', 
      description: `Designed and developed a fully functional online store for Afghan Kazan, specializing in high-quality cookware. Built using WordPress with a custom WooCommerce theme, the site features a user-friendly interface, seamless product browsing, and secure checkout. The custom design emphasizes brand identity while ensuring optimal performance and customer engagement`,
      alter: 'Afghan Kazan E-Commerce Store',
      image: `${AfghanKazan}`,
    },
    { 
      id: 2,
      title: 'Sofilight Project', 
      description: `Created a professional website for a Ukrainian company specializing in lighting solutions using Wordpress and PHP with integrated SEO tools to help the business ramp up its prospects and lead generation.Emphasis on minimalistic design and easy navigation.`,
      alter: 'Sofilight Project',
      image: `${Sofilight}`,
    },
    { 
      id: 3,
      title: 'AvtoHype E-Commerce Platform', 
      description: `Designed and developed a robust online store for Ukraine’s largest auto salvage company, AvtoHype, using CS-Cart. This comprehensive turnkey project showcases over 100,000 products, featuring a custom design, seamless navigation, and optimized performance for a large active customer base. Responsibilities included full-stack development, UI/UX design, SEO implementation, and product catalog management.`,
      alter: 'AvtoHype E-Commerce Platform',
      image: `${AvtoHype}`,
    },
    { 
      id: 4,
      title: 'CEEvisor Monitoring App', 
      description: `Designed and developed a comprehensive monitoring application for manufacturing lines, featuring custom 3D models of production lines created from scratch. Built with a React.js frontend and PHP backend, the app provides real-time performance tracking, critical component status, detailed charts, and statistics. It also includes automated alerts for technicians and managers when metrics approach critical thresholds, ensuring timely interventions.`,
      alter: 'CEEvisor Manufacturing Monitoring App',
      image: `${Ceevisor}`,
    },
    { 
      id: 5,
      title: 'Beton MSK24 E-Commerce Website', 
      description: `Designed and developed a professional online store for a leading full-cycle concrete production factory in Moscow. Built on WordPress with a custom WooCommerce theme, the site features a sleek, user-friendly design, optimized product catalog, and integrated SEO plugins to boost visibility and drive customer engagement.`,
      alter: 'Ceevisor Project',
      image: `${Beton}`,
    },
  ]);

  return (
    <section id="works">
      <Container component="main" className={classes.main} maxWidth="md">
        {projects.map((project) => (
          <div className="project" key={ project.id }>
            <div className="__img_wrapper">
              <img src={ project.image } alt={ project.alter }/>
            </div>
            <div className="__content_wrapper">
              <h3 className="title">
                <TextDecrypt text={ project.id + '. ' + project.title } />
              </h3>
              <p className="description">
                { project.description }
              </p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
};
