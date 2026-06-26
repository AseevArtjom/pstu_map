package com.project.pstu_map.repository;

import com.project.pstu_map.models.Edge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EdgeRepository extends JpaRepository<Edge,Long>
{

}
