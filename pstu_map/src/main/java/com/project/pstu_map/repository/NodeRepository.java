package com.project.pstu_map.repository;

import com.project.pstu_map.models.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NodeRepository extends JpaRepository<Node,String>
{

}
